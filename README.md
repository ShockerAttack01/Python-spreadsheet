# Money Tracker

## GitHub Pages setup

GitHub Pages hosts the phone webpage from `docs/index.html`. Google Apps Script handles the secure spreadsheet-side operation.

1. Open [script.google.com](https://script.google.com), create a project, and paste in `Code.gs`.
2. Deploy it as a web app: **Deploy > New deployment > Web app**. Set **Execute as** yourself and **Who has access** to anyone with the link.
3. Copy the web app URL into `docs/index.html`, replacing `PASTE_APPS_SCRIPT_WEB_APP_URL_HERE`.
4. Commit and push the repository to GitHub.
5. In the repository, open **Settings > Pages**, choose **Deploy from a branch**, select `main` and `/docs`, then save.

Share the spreadsheet with the Google account that owns the Apps Script project. The GitHub Pages site will then be available at `https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/` without port forwarding.

The Apps Script endpoint is intentionally public so the page can call it. Anyone who has its URL could add rows, so do not put confidential information in this sheet. Never commit `credentials.json`; revoke the service-account key that was exposed during setup before using the Flask version or deploying it elsewhere.

## Local Flask version

The Flask version in `main.py` can still run locally or on Render. Install `requirements.txt`, keep `credentials.json` beside it for local development, and run `python main.py`.