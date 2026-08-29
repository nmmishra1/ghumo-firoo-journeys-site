import { saveToBackup, getBackups, removeBackup, updateRetryCount } from './leadStorage';

// Configured with User provided URL
const GOOGLE_SHEETS_WEBAPP_URL: string = 'https://script.google.com/macros/s/AKfycby8wmvdOiDM66U9RrK9XRV5ndskA8x-0ORVTvwd7JP308RhlZSCBDp5HJu8gJvGsHv5XQ/exec';

const DEMO_URL: string = 'https://script.google.com/macros/s/AKfycbwPWVFoEJ-fKLn_7qG-ilvEKKBVCzPHIjc01L0cNmrQVgKuF9i4eYvlxyi3hOWxsdX5/exec';

export type LeadType = 'lead' | 'booking' | 'enquiry' | 'contact' | 'newsletter' | 'payment' | 'expense';

export interface LeadSubmission {
  name?: string;
  email: string;
  phone?: string;
  type: LeadType;
  source?: string;
  url?: string;
  timestamp?: string;
  [key: string]: any;
}

export const submitToGoogleSheets = async (data: LeadSubmission | any): Promise<boolean> => {
  // 0. Configuration Check
  if (GOOGLE_SHEETS_WEBAPP_URL === DEMO_URL || GOOGLE_SHEETS_WEBAPP_URL.includes('REPLACE_WITH')) {
    console.error('CRITICAL CONFIG ERROR: Google Apps Script URL is not set or is demo URL.');
    saveToBackup(data);
    return false;
  }

  // 1. Data Integrity Check
  if (!data) {
    console.error('Data integrity check failed: No data provided');
    return false;
  }

  // 2. Enhance Data with Automatic Context if missing
  const enhancedData = {
    type: data.type || 'lead',
    ...data,
    url: data.url || (typeof window !== 'undefined' ? window.location.href : ''),
    timestamp: data.timestamp || new Date().toISOString(),
  };

  // Prevent email triggering on edits/updates for leads created today
  if (enhancedData.type === 'lead' && enhancedData.isUpdate && !enhancedData.isManualSend && !enhancedData.isResend) {
    if (enhancedData.leadPurchasedDate && typeof enhancedData.leadPurchasedDate === 'string') {
      // Append a space and time if it doesn't already have it, which bypasses the exact 'YYYY-MM-DD' check in Apps Script
      if (!enhancedData.leadPurchasedDate.includes(' ') && !enhancedData.leadPurchasedDate.includes('T')) {
        enhancedData.leadPurchasedDate = `${enhancedData.leadPurchasedDate} 00:00:00`;
      } else if (enhancedData.leadPurchasedDate.includes('T')) {
        // Replace T with a space so that split('T')[0] in Apps Script returns the full string with time, bypassing the match
        enhancedData.leadPurchasedDate = enhancedData.leadPurchasedDate.replace('T', ' ');
      }
    }
  }

  // 3. Prepare Payload
  const payload = JSON.stringify(enhancedData);

  try {
    // Add a timeout to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', 
      },
      body: payload,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`Lead submitted to Google Sheets | Type: ${enhancedData.type} | Result:`, result);

    if (result.result === 'success') {
      // Only update email-tracking fields for lead submissions
      if (enhancedData.type === 'lead') {
        if (result.emailStatus) {
          data.emailStatus = result.emailStatus;
        }
        if (result.emailSentDate) {
          data.emailSentDate = result.emailSentDate;
        }
        if (result.lastEmailSentDate) {
          data.lastEmailSentDate = result.lastEmailSentDate;
        }
        if (result.emailSentCount !== undefined) {
          data.emailSentCount = result.emailSentCount;
        }
        if (result.emailHistory) {
          data.emailHistory = result.emailHistory;
        }
      }
      return true;
    } else {
      throw new Error(result.message || 'Submission failed script execution');
    }

  } catch (error) {
    console.warn('Google Sheets transmission failed.', error);
    saveToBackup(enhancedData);
    return false;
  }
};

// OTP support removed

export const retryFailedSubmissions = async (): Promise<void> => {
  if (GOOGLE_SHEETS_WEBAPP_URL === DEMO_URL) return;

  const backups = getBackups();
  if (backups.length === 0) return;

  console.log(`Attempting to retry ${backups.length} failed submissions...`);

  for (const backup of backups) {
    if (backup.retryCount >= 5) {
      console.warn(`Giving up on lead ${backup.id} after 5 retries`);
      continue;
    }

    try {
      const payload = JSON.stringify(backup.data);
      await fetch(GOOGLE_SHEETS_WEBAPP_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: payload,
      });

      console.log(`Recovered lead ${backup.id}`);
      removeBackup(backup.id);

    } catch (e) {
      updateRetryCount(backup.id);
    }
  }
};
