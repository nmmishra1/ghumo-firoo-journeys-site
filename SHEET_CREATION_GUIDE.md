# Google Sheet Creation Guide

This guide explains how to automatically generate your "Data Collection Sheet" with all the requested formatting, validation, and automation using the provided Google Apps Script.

## Prerequisites
*   A Google Account
*   Access to [Google Apps Script](https://script.google.com/)

## Step-by-Step Instructions

### 1. Create the Script
1.  Navigate to [script.google.com](https://script.google.com/home).
2.  Click the big **"+ New Project"** button in the top left.
3.  You will see a code editor. **Delete any existing code** (usually `function myFunction() {...}`).

### 2. Paste the Code
1.  Open the file `src/scripts/createDataSheet.js` provided in this repository.
2.  Copy **all the content** of that file.
3.  Paste it into the Google Apps Script editor.

### 3. Customize (Optional)
*   Look for the `CONFIG` section at the top of the script.
*   Update `EDITORS: ["user@example.com"]` with the actual email addresses of users who should have edit access.

### 4. Run the Setup
1.  In the toolbar above the code, ensure the dropdown menu says `setupSheet`.
2.  Click the **Run** button (Play icon).
3.  **Authorization**: Google will ask for permission to access your Drive and Spreadsheets.
    *   Click "Review permissions".
    *   Choose your account.
    *   If you see "Google hasn't verified this app" (since it's your own custom script), click **Advanced** -> **Go to Untitled project (unsafe)** -> **Allow**.

### 5. Access Your Sheet
1.  Once the script finishes execution, check the **Execution Log** at the bottom of the screen.
2.  It will print a URL: `Sheet Created: https://docs.google.com/spreadsheets/d/...`
3.  Click that link to open your new Data Collection Sheet.

## Features Verification

*   **Structure**: Columns ID, Name, Email, Date Added, Status are created.
*   **Formatting**: Header is bold, grey background, and frozen. Rows have alternating colors.
*   **Validation**:
    *   Try entering an invalid email in Column C -> It should reject or warn.
    *   Click a cell in Column E -> You should see a dropdown (Active, Pending, Inactive).
*   **Automation (Test It)**:
    *   Type a name (e.g., "John Doe") in **Column B** (Name).
    *   **Watch**: Column A (ID) and Column D (Date Added) will automatically fill in!
*   **Security**:
    *   The sheet is set to "View Only" for anyone with the link (unless added as an editor).
    *   Header and ID columns show a warning if you try to edit them manually.
