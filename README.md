# Money Tracker

## GitHub Pages setup

GitHub Pages hosts the phone webpage from `docs/index.html`. Google Apps Script handles the secure spreadsheet-side operation.

1. Open [script.google.com](https://script.google.com), create a project, and paste in `Code.gs`.
2. In `Code.gs`, replace `REPLACE_WITH_YOUR_GOOGLE_EMAIL` with your Google account email.
3. Deploy it as a web app: **Deploy > New deployment > Web app**. Set **Execute as** `User accessing the web app` and **Who has access** to `Anyone with Google account`.
4. Authorize the app while signed into the Google account you placed in `ALLOWED_EMAIL`.
5. Copy the web app URL into `docs/index.html`, replacing `PASTE_APPS_SCRIPT_WEB_APP_URL_HERE`.
6. Commit and push the repository to GitHub.
7. In the repository, open **Settings > Pages**, choose **Deploy from a branch**, select `main` and `/docs`, then save.
3. Copy the web app URL into `docs/index.html`, replacing `PASTE_APPS_SCRIPT_WEB_APP_URL_HERE`.
4. Commit and push the repository to GitHub.
5. In the repository, open **Settings > Pages**, choose **Deploy from a branch**, select `main` and `/docs`, then save.

Share the spreadsheet with the Google account that owns the Apps Script project. The GitHub Pages site will then be available at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` without port forwarding.

The sheet uses a `Type` column to distinguish `Purchase` and `Income` rows. The Overview tab calculates spent, earned, and balance for today, this week, this month, or this year and plots the matching entries.

To customize the appearance, edit `docs/theme.css`. Its variables are grouped by page surfaces, text, actions, and chart states; GitHub Pages loads that file automatically.

The Apps Script URL is visible in the page, but requests are restricted to your Google account. Keep the spreadsheet private and never commit `credentials.json`; revoke the service-account key that was exposed during setup before using the Flask version or deploying it elsewhere.

## Local Flask version

The Flask version in `main.py` can still run locally or on Render. Install `requirements.txt`, keep `credentials.json` beside it for local development, and run `python main.py`.