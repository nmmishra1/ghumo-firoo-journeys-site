# Google Sheets Integration & Administration Guide

This comprehensive guide explains the architecture, setup, and administration of the Google Sheets data integration for the Ghumo Firoo Journeys website.

## 1. System Architecture

The system uses a serverless architecture to securely collect data from the website and store it in Google Sheets without exposing database credentials.

*   **Frontend**: React components (forms) collect user data and send it via standard HTTP POST requests.
*   **Middleware**: Google Apps Script (GAS) deployed as a Web App acts as the API endpoint.
*   **Storage**: A centralized Google Spreadsheet ("Ghumo Firoo Data Management") stores all records in categorized tabs.
*   **Backup**: 
    *   **Cloud**: Weekly automated backups of the spreadsheet to Google Drive.
    *   **Client-side**: Failed submissions are saved to the user's browser (`localStorage`) and retried automatically on their next visit.

## 2. Initial Setup Instructions

### Step 1: Create the Google Apps Script
1.  Log in to [Google Apps Script](https://script.google.com/home).
2.  Click **+ New Project**.
3.  Rename the project to "Ghumo Firoo Backend".
4.  Open `src/scripts/createDataSheet.js` from this repository.
5.  Copy the **entire content** and paste it into the `Code.gs` file in the script editor (replace any existing code).
6.  Save the project (Ctrl+S).

### Step 2: Initialize the System
1.  In the toolbar, select the function **`setupSystem`** from the dropdown menu.
2.  Click **Run**.
3.  **Authorization**:
    *   Google will ask for permission to access Drive and Spreadsheets.
    *   Click **Review Permissions**.
    *   Choose the admin Google Account.
    *   *Note*: You may see a "Google hasn't verified this app" warning. Click **Advanced** > **Go to ... (unsafe)** to proceed (it is safe, as it is your own code).
4.  Check the **Execution Log** at the bottom. It will provide the URL of the newly created Spreadsheet.

### Step 3: Deploy as Web App
1.  Click the blue **Deploy** button (top right) > **New deployment**.
2.  Click the **Select type** (gear icon) > **Web app**.
3.  Configure:
    *   **Description**: Production Endpoint
    *   **Execute as**: **Me** (your email)
    *   **Who has access**: **Anyone** (Critical: This allows the public website to send data without login).
4.  Click **Deploy**.
5.  **Copy the Web App URL** (starts with `https://script.google.com/macros/s/...`).

### Step 4: Connect the Website
1.  Open `src/lib/googleSheets.ts` in your code editor.
2.  Replace the `GOOGLE_SHEETS_WEBAPP_URL` constant with your new Web App URL.
3.  Commit and deploy the website updates.

## 3. Data Management (Administrator Guide)

Access the spreadsheet named **"Ghumo Firoo Data Management"** in your Google Drive.

### Sheet Structure
The spreadsheet is organized into the following tabs:

| Tab Name | Purpose | Key Columns |
| :--- | :--- | :--- |
| **Dashboard** | Real-time overview of metrics | Total Leads, Bookings, Enquiries, Subscribers |
| **Leads** | General leads from landing pages | Name, Email, Phone, Source, Status, Package Interest |
| **Bookings** | Direct booking requests | Booking ID, Package, Amount, Travelers, Payment Status |
| **Enquiries** | Custom trip enquiries | Destination, Budget, Travel Dates, Message |
| **Contact Messages** | General contact form submissions | Subject, Message, Sender Info |
| **Newsletter Subs** | Email subscriptions from footer | Email, Timestamp, Status |
| **Configuration** | Dropdown options & system settings | **Hidden by default**. View > Hidden sheets to access. |

### Managing Records
*   **Status Updates**: Use the dropdown menus in the "Status" columns (e.g., "New", "Contacted", "Converted") to track progress.
*   **Validation**: Invalid data (e.g., malformed emails) will be flagged by Google Sheets validation rules.
*   **Concurrent Access**: The system supports multiple users editing the sheet simultaneously.

### Security & Access Control
*   **Sharing**: Use the standard Google Sheets **Share** button to give access to team members.
    *   **Viewer**: Can see data but not edit.
    *   **Editor**: Can update statuses and manage rows.
*   **Protection**: The header rows are protected to prevent accidental deletion.

## 4. Troubleshooting & Auditing

### Missing Submissions?
1.  **Check Backups**: Look for a folder named **"Ghumo Firoo Backups"** in your Google Drive. The script creates weekly backups automatically.
2.  **Script Logs**: In the Apps Script editor, click **Executions** (left sidebar) to see a log of every received request and any errors.

### "Network Error" on Website?
The website has a built-in failover:
1.  If the Google Sheet is unreachable, the data is saved to the user's browser.
2.  The system will silently retry sending the data the next time the user visits any page on the site.
3.  Look for `localStorage` entries with key `ghumo_firoo_pending_leads` in the browser dev tools if debugging is needed.

### Modifying Dropdown Options
To add new Lead Sources or Statuses:
1.  Open the spreadsheet.
2.  Go to **View > Hidden sheets > Configuration**.
3.  Add or remove items from the respective lists.
4.  The dropdowns in the main sheets will update automatically (uses Named Ranges).
