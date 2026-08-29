# Google Sheets CORS & Transmission Guide

You were previously seeing CORS errors (e.g., `Access-Control-Allow-Origin` missing) because modern browsers block cross-origin requests to Google Apps Script redirects.

## The Fix: "No-CORS" Mode

We have updated the frontend code (`src/lib/googleSheets.ts` and `src/lib/googleSheetsLanding.ts`) to use `mode: 'no-cors'`.

**What this means:**
1.  **Success**: The browser will send the data to Google Sheets.
2.  **Opaque Response**: The browser will *not* let our code read the response (success message or error details) from Google. It will just say "request sent".
3.  **No Error**: You will no longer see the red CORS error in the console.

## How to Verify It's Working

Since the website can no longer confirm "Success" from the server response, you must verify data arrival manually:

1.  **Submit a form** on your website (Enquire Now, Contact, etc.).
2.  **Check your Google Sheet** ("Ghumo Firoo Data Management").
3.  The new row should appear within 2-5 seconds.

## Troubleshooting

If data is **NOT** appearing in the sheet:

1.  **Check the Script Executions**:
    *   Go to [Google Apps Script Dashboard](https://script.google.com/home).
    *   Open your project ("Ghumo Firoo Backend" or similar).
    *   Click **Executions** on the left sidebar.
    *   Look for `POST` requests.
        *   **Completed**: The script ran successfully. Check your Sheet tabs.
        *   **Failed**: Click the row to see the error (e.g., "Sheet not found", "Invalid JSON").
        *   **No logs**: The request never reached Google. Check your internet or the Web App URL in `src/lib/googleSheets.ts`.

2.  **Check Script Deployment**:
    *   Ensure you deployed as **"Me"** and **"Anyone"**.
    *   If you deployed as "Only myself", the request will fail (silently in no-cors mode).

3.  **Check the Web App URL**:
    *   Verify `src/lib/googleSheets.ts` has the correct `https://script.google.com/macros/s/.../exec` URL.
