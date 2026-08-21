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