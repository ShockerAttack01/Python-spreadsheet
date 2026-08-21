import json
import os
from datetime import date
from pathlib import Path

import gspread
from flask import Flask, jsonify, render_template, request
from google.oauth2.service_account import Credentials

app = Flask(__name__)
SCOPES = ["https://www.googleapis.com/auth/spreadsheets"]
SHEET_ID = os.getenv("GOOGLE_SHEET_ID", "1TUwR0vjcqEkGqFDc4nuekuN2wOgjQiJr2-N6JWCMlZc")
WORKSHEET_NAME = os.getenv("GOOGLE_WORKSHEET", "Sheet1")
HEADERS = ["Date", "Item", "Category", "Amount", "Notes"]


def get_workbook():
    credentials_json = os.getenv("GOOGLE_SERVICE_ACCOUNT_JSON")
    if credentials_json:
        credentials = Credentials.from_service_account_info(
            json.loads(credentials_json), scopes=SCOPES
        )
    else:
        credentials_path = Path(__file__).with_name("credentials.json")
        credentials = Credentials.from_service_account_file(credentials_path, scopes=SCOPES)
    return gspread.authorize(credentials).open_by_key(SHEET_ID)


def get_worksheet():
    workbook = get_workbook()
    try:
        worksheet = workbook.worksheet(WORKSHEET_NAME)
    except gspread.WorksheetNotFound:
        worksheet = workbook.sheet1
    if not worksheet.row_values(1):
        worksheet.append_row(HEADERS, value_input_option="USER_ENTERED")
    return worksheet


@app.get("/")
def index():
    return render_template("index.html", today=date.today().isoformat())


@app.get("/api/purchases")
def purchases():
    rows = get_worksheet().get_all_records()
    return jsonify(rows[-20:][::-1])


@app.post("/api/purchases")
def add_purchase():
    data = request.get_json(silent=True) or {}
    item = str(data.get("item", "")).strip()
    amount = str(data.get("amount", "")).strip()
    if not item or not amount:
        return jsonify(error="Item and amount are required."), 400
    try:
        float(amount)
    except ValueError:
        return jsonify(error="Amount must be a number."), 400
    row = [
        str(data.get("date") or date.today().isoformat()), item,
        str(data.get("category", "General")).strip() or "General", amount,
        str(data.get("notes", "")).strip(),
    ]
    get_worksheet().append_row(row, value_input_option="USER_ENTERED")
    return jsonify(message="Purchase added.", purchase=dict(zip(HEADERS, row))), 201


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=False)

