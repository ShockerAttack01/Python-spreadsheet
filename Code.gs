const SHEET_ID = '1TUwR0vjcqEkGqFDc4nuekuN2wOgjQiJr2-N6JWCMlZc';
const SHEET_NAME = 'Sheet1';
const ALLOWED_EMAIL = 'fortnitekai77@gmail.com';
const HEADERS = ['Date', 'Item', 'Category', 'Amount', 'Notes', 'Time', 'Store', 'Type'];

function doGet(event) {
  const params = event.parameter || {};
  const activeEmail = Session.getActiveUser().getEmail().toLowerCase();
  if (activeEmail !== ALLOWED_EMAIL.toLowerCase()) {
    return jsonp(params.callback, { error: 'Access denied.' });
  }
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  ensureHeaders(sheet);
  if (params.action === 'add') {
    const time = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'h:mm a');
    sheet.appendRow([params.date, params.item, params.category || 'General', params.amount, params.notes || '', time, params.store || '', 'Purchase']);
  } else if (params.action === 'income') {
    const time = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'h:mm a');
    sheet.appendRow([params.date, params.source, 'Income', params.amount, params.notes || '', time, '', 'Income']);
  } else if (params.action === 'merge' && params.csv) {
    const result = mergeCsv(sheet, params.csv);
    return jsonp(params.callback, result);
  }
  const values = sheet.getDataRange().getDisplayValues();
  const rows = values.slice(1).slice(-20).reverse().map(row => Object.fromEntries(HEADERS.map((key, index) => [key, row[index] || ''])));
  const stores = [...new Set(values.slice(1).map(row => String(row[6] || '').trim()).filter(Boolean))].sort();
  const entries = values.slice(1).map(row => ({ date: row[0], amount: Number(String(row[3] || '').replace(/[^0-9.-]/g, '')) || 0, type: String(row[7] || '').trim().toLowerCase() === 'income' || String(row[2] || '').trim().toLowerCase() === 'income' ? 'Income' : 'Purchase', category: row[2] || 'General', store: row[6] || '', time: row[5] || '', item: row[1] || '' }));
  return jsonp(params.callback, { rows: rows, stores: stores, entries: entries, added: ['add', 'income'].includes(params.action) });
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else if (sheet.getRange(1, 6).getDisplayValue() !== 'Time') {
    sheet.getRange(1, 6).setValue('Time');
  }
  if (sheet.getRange(1, 7).getDisplayValue() !== 'Store') {
    sheet.getRange(1, 7).setValue('Store');
  }
  if (sheet.getRange(1, 8).getDisplayValue() !== 'Type') {
    sheet.getRange(1, 8).setValue('Type');
  }
}

function jsonp(callback, data) {
  const body = JSON.stringify(data);
  return ContentService.createTextOutput(callback ? `${callback}(${body})` : body).setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function mergeCsv(sheet, encodedCsv) {
  const csv = Utilities.newBlob(Utilities.base64Decode(encodedCsv)).getDataAsString('UTF-8');
  const rows = parseCsv(csv).filter(row => row.some(value => String(value).trim()));
  if (rows.length < 2) return { error: 'The CSV needs a header row and at least one data row.' };
  const headers = rows.shift().map(value => String(value).trim().toLowerCase());
  const existing = new Set(sheet.getDataRange().getDisplayValues().slice(1).map(row => rowSignature(row)));
  const additions = [];
  rows.forEach(row => {
    const get = name => { const index = headers.indexOf(name); return index >= 0 ? String(row[index] || '').trim() : ''; };
    const transaction = get('transaction').toLowerCase();
    const rawAmount = Number(get('amount').replace(/[$,]/g, ''));
    const isIncome = get('type').toLowerCase() === 'income' || transaction === 'credit' || transaction.includes('credit');
    const item = get('item') || get('source') || get('name') || get('transaction') || get('memo');
    const amount = Number.isFinite(rawAmount) ? Math.abs(rawAmount).toFixed(2) : '';
    const values = [get('date'), item, get('category') || (isIncome ? 'Income' : 'General'), amount, get('notes') || get('memo'), get('time'), get('store'), isIncome ? 'Income' : 'Purchase'];
    if (!values[0] || !values[1] || !values[3]) return;
    if (!existing.has(rowSignature(values))) { additions.push(values); existing.add(rowSignature(values)); }
  });
  if (additions.length) sheet.getRange(sheet.getLastRow() + 1, 1, additions.length, HEADERS.length).setValues(additions);
  return { added: additions.length, skipped: rows.length - additions.length, message: `Merged ${additions.length} new row${additions.length === 1 ? '' : 's'}.` };
}

function rowSignature(row) {
  return row.slice(0, HEADERS.length).map(value => String(value || '').trim().toLowerCase()).join('|');
}

function parseCsv(text) {
  const rows = [];
  let row = [], value = '', quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === '"' && quoted && text[index + 1] === '"') { value += '"'; index += 1; }
    else if (character === '"') quoted = !quoted;
    else if (character === ',' && !quoted) { row.push(value); value = ''; }
    else if ((character === '\n' || character === '\r') && !quoted) { if (character === '\r' && text[index + 1] === '\n') index += 1; row.push(value); rows.push(row); row = []; value = ''; }
    else value += character;
  }
  if (value || row.length) { row.push(value); rows.push(row); }
  return rows;
}