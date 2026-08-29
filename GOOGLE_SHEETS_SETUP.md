# Google Sheets Integration Setup Guide

This guide explains how to connect your lead generation form to Google Sheets using a secure Google Apps Script Web App.

## 1. Setup Google Sheet & Script

1.  Go to [Google Apps Script](https://script.google.com/home).
2.  Click **New Project**.
3.  Copy the content of `src/scripts/createDataSheet.js` and paste it into `Code.gs`.
4.  **Run the `setupSystem` function** once:
    *   This will initialize the "Lead Management" sheet, "Configuration" sheet, and "Dashboard".
    *   It creates a "Lead Backups" folder in your Google Drive.
    *   It sets up weekly backup triggers.

## 2. Deploy as Web App

1.  Click the blue **Deploy** button > **New deployment**.
2.  Click the **Select type** gear icon > **Web app**.
3.  Fill in the details:
    *   **Description**: Lead Form Receiver
    *   **Execute as**: **Me** (your email)
    *   **Who has access**: **Anyone** (This is crucial for the form to work without user login)
4.  Click **Deploy**.
5.  Authorize the script (you may see a "Google hasn't verified this app" warning; click **Advanced** > **Go to ... (unsafe)** to proceed).
6.  **Copy the Web App URL** (it starts with `https://script.google.com/macros/s/...`).

## 4. Connect to Frontend

1.  Open the file `src/lib/googleSheets.ts` in your project.
2.  Replace the placeholder URL with your new Web App URL:

```typescript
// src/lib/googleSheets.ts
const GOOGLE_SHEETS_WEBAPP_URL = 'https://script.google.com/macros/s/YOUR_NEW_URL_HERE/exec';
```

## 5. System Features

### Automatic Backup & Retry
If the Google Sheets API is unreachable (e.g., poor internet), the system automatically:
1.  **Saves the lead locally** in the user's browser (`localStorage`).
2.  **Shows a success message** to the user so they don't worry.
3.  **Retries sending** the lead automatically the next time the user visits the page or reloads.

### Monitoring
To track success rates:
1.  Check your Google Sheet for new rows.
2.  Open the **Executions** tab in the Apps Script dashboard to see success/failure logs.
