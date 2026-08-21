const SHEET_ID = '1TUwR0vjcqEkGqFDc4nuekuN2wOgjQiJr2-N6JWCMlZc';
const SHEET_NAME = 'Sheet1';
const HEADERS = ['Date', 'Item', 'Category', 'Amount', 'Notes'];

function doGet(event) {
  const params = event.parameter || {};
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  ensureHeaders(sheet);
  if (params.action === 'add') {
    sheet.appendRow([params.date, params.item, params.category || 'General', params.amount, params.notes || '']);
  }
  const values = sheet.getDataRange().getDisplayValues();
  const rows = values.slice(1).slice(-20).reverse().map(row => Object.fromEntries(HEADERS.map((key, index) => [key, row[index] || ''])));
  return jsonp(params.callback, { rows: rows, added: params.action === 'add' });
}

function ensureHeaders(sheet) {
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
}

function jsonp(callback, data) {
  const body = JSON.stringify(data);
  return ContentService.createTextOutput(callback ? `${callback}(${body})` : body).setMimeType(ContentService.MimeType.JAVASCRIPT);
}