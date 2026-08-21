const SHEET_ID = '1TUwR0vjcqEkGqFDc4nuekuN2wOgjQiJr2-N6JWCMlZc';
const SHEET_NAME = 'Sheet1';
const ALLOWED_EMAIL = 'fortnitekai77@gmail.com';
const HEADERS = ['Date', 'Item', 'Category', 'Amount', 'Notes', 'Time'];

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
    sheet.appendRow([params.date, params.item, params.category || 'General', params.amount, params.notes || '', time]);
  }
  const values = sheet.getDataRange().getDisplayValues();
  const rows = values.slice(1).slice(-20).reverse().map(row => Object.fromEntries(HEADERS.map((key, index) => [key, row[index] || ''])));
  return jsonp(params.callback, { rows: rows, added: params.action === 'add' });
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
  } else if (sheet.getRange(1, 6).getDisplayValue() !== 'Time') {
    sheet.getRange(1, 6).setValue('Time');
  }
}

function jsonp(callback, data) {
  const body = JSON.stringify(data);
  return ContentService.createTextOutput(callback ? `${callback}(${body})` : body).setMimeType(ContentService.MimeType.JAVASCRIPT);
}