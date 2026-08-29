
/**
 * Google Apps Script for Comprehensive Lead & Data Management System
 * 
 * INSTRUCTIONS:
 * 1. Go to https://script.google.com/home
 * 2. Create a New Project
 * 3. Paste this code into Code.gs
 * 4. Run 'setupSystem' function once to initialize the entire system.
 * 5. Deploy as Web App (Execute as: Me, Access: Anyone).
 * 6. Use the Web App URL in your frontend application.
 */

// CONFIGURATION
var CONFIG = {
  FILENAME: "Ghumo Firoo Data Management",
  SHEETS: {
    LEADS: "Leads",
    BOOKINGS: "Bookings",
    ENQUIRIES: "Enquiries",
    CONTACT: "Contact Messages",
    NEWSLETTER: "Newsletter Subs",
    DASHBOARD: "Dashboard",
    CONFIG: "Configuration",
    OTPS: "OTPS",
    VERIFIED_TOKENS: "VerifiedTokens",
    DISCUSSION_HISTORY: "DiscussionHistory",
    BOOKING_PAYMENTS: "BookingPayments",
    EXPENSE_MASTER: "ExpenseMaster",
    LEAD_JOURNEY: "LeadJourney"
  },
  HEADER_COLOR: "#f0f0f0",
  HEADER_FONT_WEIGHT: "bold",
  BACKUP_FOLDER_NAME: "Ghumo Firoo Backups",
  // Dropdown Options
  SOURCES: ["custom-tour-packages", "Book Now", "enquire-now", "contact us", "landing_page_lead_form", "Other"],
  STATUSES: {
    LEAD: ["New", "Contacted", "Qualified", "Converted", "Lost", "Spam"],
    BOOKING: ["New", "Confirmed", "Payment Pending", "Paid", "Cancelled"],
    GENERAL: ["New", "Replied", "Closed", "Spam"]
  },
  OTP_EXPIRY_MINUTES: 5,
  MAX_OTP_ATTEMPTS: 3
};

/**
 * MASTER SETUP FUNCTION
 */
function setupSystem() {
  var ss = getSpreadsheet();
  
  if (SpreadsheetApp.getActiveSpreadsheet()) {
     ss.rename(CONFIG.FILENAME);
  } else {
     console.log("Using Standalone Spreadsheet: " + ss.getUrl());
  }
  
  createConfigSheet(ss);
  createLeadSheet(ss);
  createBookingSheet(ss);
  createEnquirySheet(ss);
  createContactSheet(ss);
  createNewsletterSheet(ss);
  createDashboardSheet(ss);
  createOtpSheet(ss);
  createVerifiedTokensSheet(ss);
  createDiscussionHistorySheet(ss);
  createBookingPaymentsSheet(ss);
  createExpenseMasterSheet(ss);
  createLeadJourneySheet(ss);
  setupTriggers();
  
  Logger.log("System Setup Complete. URL: " + ss.getUrl());
}

/**
 * Helper to get the spreadsheet regardless of script type (Bound vs Standalone)
 */
function getSpreadsheet() {
  // 1. Try to get the active spreadsheet (if bound)
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // 2. If null (standalone script), check for stored ID
  if (!ss) {
    var props = PropertiesService.getScriptProperties();
    var sheetId = props.getProperty('SHEET_ID');
    
    if (sheetId) {
      try {
        ss = SpreadsheetApp.openById(sheetId);
      } catch (e) {
        console.warn("Stored sheet ID not found or invalid. Creating new one.");
      }
    }
    
    // 3. If still no sheet, create a new one and store ID
    if (!ss) {
      ss = SpreadsheetApp.create(CONFIG.FILENAME);
      props.setProperty('SHEET_ID', ss.getId());
      console.log("Created new spreadsheet: " + ss.getUrl());
    }
  }
  return ss;
}

/**
 * 1. Configuration Sheet
 */
function createConfigSheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.CONFIG);
  sheet.clear();
  
  sheet.getRange("A1:C1").setValues([["Sources", "Lead Status", "Booking Status"]]).setFontWeight("bold");
  
  setColumnValues(sheet, 1, CONFIG.SOURCES);
  setColumnValues(sheet, 2, CONFIG.STATUSES.LEAD);
  setColumnValues(sheet, 3, CONFIG.STATUSES.BOOKING);
  
  ss.setNamedRange("SourceList", sheet.getRange(2, 1, Math.max(CONFIG.SOURCES.length, 1), 1));
  ss.setNamedRange("LeadStatusList", sheet.getRange(2, 2, Math.max(CONFIG.STATUSES.LEAD.length, 1), 1));
  ss.setNamedRange("BookingStatusList", sheet.getRange(2, 3, Math.max(CONFIG.STATUSES.BOOKING.length, 1), 1));
  
  sheet.hideSheet();
}

/**
 * 2. Leads Sheet
 */
function createLeadSheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.LEADS);
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Lead ID", "Lead Purchased Date", "Customer Name", "Contact Number", "Email", 
      "Lead Source", "Pipeline Status", "Customer Category", "Tour Package Name", 
      "Lead Destination", "Package Cost", "Trip Start Date", "Trip End Date", 
      "Number Of Nights", "Adult Count", "Child Count", "Infant Count", "Total Pax Count", 
      "Last Contact Date", "Next Follow-Up Date", "Days Since Last Contact", "Lost Reason",
      "Email Status", "Email Sent Date", "Last Email Sent Date", "Email Sent Count",
      "City", "Travel Month", "Number Of Travellers",
      "Brochure Requested", "Brochure Sent", "Brochure Sent Date", "Brochure Email Status",
      "Attached Packages"
    ];
    setupSheetHeaders(sheet, headers);
    
    // Validation
    setValidation(sheet, 3, null, '=LEN(C2)>=2', "Name must be at least 2 chars"); // Name
    setValidation(sheet, 4, null, '=REGEXMATCH(TO_TEXT(D2), "^[+\\d\\s\\-()]{8,}$")', "Phone number must be at least 8 digits"); // Contact Number (Column D)
    setValidation(sheet, 5, SpreadsheetApp.newDataValidation().requireTextIsEmail().build()); // Email (Column E)
  } else {
    // Check if new fields are missing and append them to existing headers
    var existingHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Rename Lead Created Date to Lead Purchased Date if present in header
    var col2Header = sheet.getRange(1, 2).getValue();
    if (col2Header === "Lead Created Date") {
      sheet.getRange(1, 2).setValue("Lead Purchased Date")
           .setFontWeight(CONFIG.HEADER_FONT_WEIGHT).setBackground(CONFIG.HEADER_COLOR);
      existingHeaders[1] = "Lead Purchased Date";
    }
    
    var newHeaders = [
      "Customer Category", "Lead Destination", "Package Cost", "Trip Start Date", 
      "Trip End Date", "Number Of Nights", "Adult Count", "Child Count", "Infant Count", 
      "Total Pax Count", "Last Contact Date", "Next Follow-Up Date", "Days Since Last Contact", "Lost Reason",
      "Email Status", "Email Sent Date", "Last Email Sent Date", "Email Sent Count",
      "City", "Travel Month", "Number Of Travellers",
      "Brochure Requested", "Brochure Sent", "Brochure Sent Date", "Brochure Email Status",
      "Attached Packages"
    ];
    for (var i = 0; i < newHeaders.length; i++) {
      if (existingHeaders.indexOf(newHeaders[i]) === -1) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(newHeaders[i])
             .setFontWeight(CONFIG.HEADER_FONT_WEIGHT).setBackground(CONFIG.HEADER_COLOR);
      }
    }
  }
}

/**
 * 3. Bookings Sheet
 */
function createBookingSheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.BOOKINGS);
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Booking ID", "Timestamp", "First Name", "Last Name", "Email", "Phone",
      "Package Name", "Duration", "Price Per Person", "Travelers", "Total Amount",
      "Booking Date", "Status", "Payment Status"
    ];
    setupSheetHeaders(sheet, headers);
    
    setValidation(sheet, 13, SpreadsheetApp.newDataValidation().requireValueInRange(ss.getRangeByName("BookingStatusList")).build()); // Status
  }
}

/**
 * 4. Enquiries Sheet
 */
function createEnquirySheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.ENQUIRIES);
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Enquiry ID", "Timestamp", "Full Name", "Email", "Phone",
      "Package Type", "Destination", "Travel Dates", "Travelers", "Budget",
      "Special Requests", "Message", "Status"
    ];
    setupSheetHeaders(sheet, headers);
  }
}

/**
 * 5. Contact Sheet
 */
function createContactSheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.CONTACT);
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Contact ID", "Timestamp", "Full Name", "Email", "Phone",
      "Subject", "Message", "Status"
    ];
    setupSheetHeaders(sheet, headers);
  }
}

/**
 * 6. Newsletter Sheet
 */
function createNewsletterSheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.NEWSLETTER);
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Subscriber ID", "Timestamp", "Email", "Status"
    ];
    setupSheetHeaders(sheet, headers);
  }
}

/**
 * 7. Dashboard Sheet
 */
function createDashboardSheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.DASHBOARD);
  sheet.clear();
  
  sheet.getRange("A1").setValue("Executive Dashboard").setFontSize(18).setFontWeight("bold");
  
  // Simple Counts
  var metrics = [
    ["Total Leads", '=COUNTA(\'' + CONFIG.SHEETS.LEADS + '\'!A2:A)'],
    ["Total Bookings", '=COUNTA(\'' + CONFIG.SHEETS.BOOKINGS + '\'!A2:A)'],
    ["Total Enquiries", '=COUNTA(\'' + CONFIG.SHEETS.ENQUIRIES + '\'!A2:A)'],
    ["Total Messages", '=COUNTA(\'' + CONFIG.SHEETS.CONTACT + '\'!A2:A)'],
    ["Total Subscribers", '=COUNTA(\'' + CONFIG.SHEETS.NEWSLETTER + '\'!A2:A)']
  ];
  
  sheet.getRange(3, 1, metrics.length, 1).setValues(metrics.map(m => [m[0]]));
  sheet.getRange(3, 2, metrics.length, 1).setFormulas(metrics.map(m => [m[1]]));
}

/**
 * 8. OTP Storage Sheet (Temporary)
 */
function createOtpSheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.OTPS);
  if (sheet.getLastRow() === 0) {
    var headers = ["Email/Phone", "OTP", "Timestamp", "Attempts", "Token"];
    setupSheetHeaders(sheet, headers);
  }
  sheet.hideSheet(); // Hide for security
}

/**
 * 9. Verified Tokens Sheet (For 2-Step Verification)
 */
function createVerifiedTokensSheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.VERIFIED_TOKENS);
  if (sheet.getLastRow() === 0) {
    var headers = ["Token", "Email", "Verified At", "Used"];
    setupSheetHeaders(sheet, headers);
  }
  sheet.hideSheet(); // Hide for security
}

/**
 * 10. Discussion History Sheet
 */
function createDiscussionHistorySheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.DISCUSSION_HISTORY);
  if (sheet.getLastRow() === 0) {
    var headers = ["Lead ID", "Customer Name", "Discussion Type", "Remark", "Created By", "Date", "Time", "Timestamp"];
    setupSheetHeaders(sheet, headers);
  }
}

/**
 * API: doPost
 * Handles Form Submissions & OTP
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  
  try {
    var ss = getSpreadsheet();
    var data = JSON.parse(e.postData.contents);
    var action = data.action;

    // --- OTP LOGIC ---
    if (action === 'send_otp') {
      return handleSendOtp(ss, data);
    } else if (action === 'verify_otp') {
      return handleVerifyOtp(ss, data);
    }
    
    // --- LEAD SUBMISSION LOGIC (Only after verification) ---
    // In production, you would check for a verification token here, but for simplicity
    // we assume the frontend only calls this after verification.
    // For extra security, pass the 'token' from verify_otp and check it here.
    
    if (data.verificationToken) {
       if (!isValidToken(ss, data.email || data.emailAddress, data.verificationToken)) {
          throw new Error("Invalid or expired verification token.");
       }
    }

    var type = data.type || 'lead';
    var existingRowIndex = -1;
    var sheetName, rowData;
    var timestamp = new Date();
    var uuid = generateUUID();
    
    // --- ROUTING LOGIC ---
    if (type === 'lead') {
      sheetName = CONFIG.SHEETS.LEADS;
      var targetSheet = ss.getSheetByName(sheetName);
      if (!targetSheet) throw new Error("Sheet not found: " + sheetName);
      
      var headers = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];
      var emailColIdx = headers.indexOf("Email") !== -1 ? headers.indexOf("Email") + 1 : 4;
      var phoneColIdx = headers.indexOf("Phone") !== -1 ? headers.indexOf("Phone") + 1 : 
                        (headers.indexOf("Contact Number") !== -1 ? headers.indexOf("Contact Number") + 1 : 5);
      
      var checkEmail = data.customerEmail || data.email;
      var checkPhone = data.customerPhone || data.phone || data.contactNumber;
      var leadIdToFind = data.leadId || data.id;
      
      existingRowIndex = findRowIndexById(targetSheet, 1, leadIdToFind);
      
      if (data.isDelete === true) {
        if (existingRowIndex !== -1) {
          targetSheet.deleteRow(existingRowIndex);
          return createResponse({ 'result': 'success', 'message': 'Lead deleted', 'id': leadIdToFind });
        } else {
          return createResponse({ 'result': 'error', 'message': 'Lead not found for delete' });
        }
      }
      
      var isResend = data.isResend === true;
      if (!isResend && !data.isUpdate && existingRowIndex === -1 && checkCompositeDuplicate(targetSheet, checkEmail, checkPhone, emailColIdx, phoneColIdx)) {
        return createResponse({ 'result': 'success', 'message': 'Duplicate Entry', 'id': 'duplicate' });
      }
      
      rowData = new Array(headers.length).fill("");
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        switch(header) {
          case "Lead ID": 
            rowData[j] = data.leadId || data.id || uuid; 
            break;
          case "Timestamp":
          case "Lead Created Date": 
          case "Lead Purchased Date": 
            rowData[j] = data.leadPurchasedDate || data.leadCreatedDate || data.createdAt || timestamp; 
            break;
          case "Email Status":
            rowData[j] = data.emailStatus || "Pending";
            break;
          case "Email Sent Date":
            rowData[j] = data.emailSentDate || "";
            break;
          case "Last Email Sent Date":
            rowData[j] = data.lastEmailSentDate || "";
            break;
          case "Email Sent Count":
            rowData[j] = data.emailSentCount || 0;
            break;
          case "Full Name":
          case "Customer Name": 
            rowData[j] = data.customerName || data.fullName || data.name || ""; 
            break;
          case "Email": 
            rowData[j] = data.customerEmail || data.email || ""; 
            break;
          case "Phone":
          case "Contact Number": 
            rowData[j] = data.customerPhone || data.phone || data.contactNumber || ""; 
            break;
          case "Source":
          case "Lead Source": 
            rowData[j] = data.source || data.leadSource || "Other"; 
            break;
          case "Status":
          case "Pipeline Status": 
            rowData[j] = data.status || data.pipelineStatus || "New Inquiry"; 
            break;
          case "Notes": 
            rowData[j] = data.notes || data.message || ""; 
            break;
          case "Package Interest":
          case "Tour Package Name": 
            rowData[j] = data.packageName || data.tourPackageName || data.package_interest || ""; 
            break;
          case "Travel Date":
          case "Trip Start Date": 
            rowData[j] = data.tripStartDate || data.travel_date || data.travelDates || ""; 
            break;
          case "Device Info": 
            rowData[j] = data.device_platform || ""; 
            break;
          case "Session ID": 
            rowData[j] = data.session_id || ""; 
            break;
          case "Customer Category": 
            rowData[j] = data.customerCategory || ""; 
            break;
          case "Lead Destination": 
            rowData[j] = Array.isArray(data.leadDestination) ? data.leadDestination.join(", ") : (data.leadDestination || data.destinations || ""); 
            break;
          case "Package Cost": 
            rowData[j] = data.packageCost || data.packagePrice || 0; 
            break;
          case "Trip End Date": 
            rowData[j] = data.tripEndDate || ""; 
            break;
          case "Number Of Nights": 
            rowData[j] = data.numberOfNights || 0; 
            break;
          case "Adult Count": 
            rowData[j] = data.adultCount || 0; 
            break;
          case "Child Count": 
            rowData[j] = data.childCount || 0; 
            break;
          case "Infant Count": 
            rowData[j] = data.infantCount || 0; 
            break;
          case "Total Pax Count": 
            rowData[j] = data.totalPaxCount || 0; 
            break;
          case "Last Contact Date": 
            rowData[j] = data.lastContactDate || ""; 
            break;
          case "Next Follow-Up Date": 
            rowData[j] = data.nextFollowUpDate || data.followUpDate || ""; 
            break;
          case "Days Since Last Contact": 
            rowData[j] = data.daysSinceLastContact || 0; 
            break;
          case "Lost Reason": 
            rowData[j] = data.lostReason || ""; 
            break;
          case "City": 
            rowData[j] = data.city || ""; 
            break;
          case "Travel Month": 
            rowData[j] = data.travelMonth || ""; 
            break;
          case "Number Of Travellers": 
            rowData[j] = data.numberOfTravelers || data.numTravelers || ""; 
            break;
          case "Brochure Requested": 
            rowData[j] = data.brochureRequested || "No"; 
            break;
          case "Brochure Sent": 
            rowData[j] = data.brochureSent || "No"; 
            break;
          case "Brochure Sent Date": 
            rowData[j] = data.brochureSentDate || ""; 
            break;
          case "Brochure Email Status": 
            rowData[j] = data.brochureEmailStatus || ""; 
            break;
          case "Attached Packages":
            if (Array.isArray(data.attachedPackages)) {
              rowData[j] = data.attachedPackages.map(function(pkg) {
                return pkg.packageName + " (Cost: \u20B9" + (pkg.packageCost || 0) + ", Date: " + (pkg.travelDate || "None") + ", Pax: " + (pkg.numberOfPax || 0) + ")";
              }).join(" | ");
            } else {
              rowData[j] = data.attachedPackages || "";
            }
            break;
        }
      }
    } else if (type === 'booking') {
      sheetName = CONFIG.SHEETS.BOOKINGS;
      var pd = data.packageData || {};
      rowData = [
        data.bookingId || uuid, timestamp, data.firstName, data.lastName, data.email, data.phone,
        pd.title || "", pd.duration || "", pd.price || 0, data.numberOfTravelers || 1,
        data.totalAmount || 0, data.bookingDate || timestamp, "New", "Pending"
      ];
    } else if (type === 'enquiry') {
      sheetName = CONFIG.SHEETS.ENQUIRIES;
      // DUPLICATE CHECK
      if (checkCompositeDuplicate(ss.getSheetByName(sheetName), data.email, data.phone, 4, 5)) {
        return createResponse({ 'result': 'success', 'message': 'Duplicate Entry', 'id': 'duplicate' });
      }
      rowData = [
        uuid, timestamp, data.name || data.fullName, data.email, data.phone,
        data.packageType || data.package_interest || "", 
        Array.isArray(data.destination) ? data.destination.join(", ") : (data.destination || ""),
        data.travelDates || data.travel_date || "", 
        data.numberOfTravelers, 
        data.budget || "",
        data.specialRequests || "", 
        data.message || data.notes || "", 
        "New"
      ];
    } else if (type === 'contact') {
      sheetName = CONFIG.SHEETS.CONTACT;
      // DUPLICATE CHECK
      if (checkCompositeDuplicate(ss.getSheetByName(sheetName), data.email, data.phone, 4, 5)) {
        return createResponse({ 'result': 'success', 'message': 'Duplicate Entry', 'id': 'duplicate' });
      }
      rowData = [
        data.contactId || uuid, timestamp, data.name || data.fullName, data.email, data.phone || "",
        data.subject || "General Inquiry", data.message || data.notes || "", "New"
      ];
    } else if (type === 'newsletter') {
      sheetName = CONFIG.SHEETS.NEWSLETTER;
      
      // DUPLICATE CHECK
      var sheet = ss.getSheetByName(sheetName);
      if (checkDuplicate(sheet, 3, data.email)) { // Column 3 is Email
        return createResponse({ 'result': 'success', 'message': 'Already subscribed', 'id': 'duplicate' });
      }
      
      rowData = [
        uuid, timestamp, data.email, "Subscribed"
      ];
    } else if (type === 'payment') {
      sheetName = CONFIG.SHEETS.BOOKING_PAYMENTS || "BookingPayments";
      var targetSheet = getOrCreateSheet(ss, sheetName);
      if (targetSheet.getLastRow() === 0) {
        var headers = ["Payment ID", "Lead ID", "Customer Name", "Payment Date", "Amount", "Mode", "Reference Number", "Remarks", "Timestamp", "Created By"];
        setupSheetHeaders(targetSheet, headers);
      }
      var headers = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];
      var paymentIdToFind = data.paymentId || data.id;
      existingRowIndex = findRowIndexById(targetSheet, 1, paymentIdToFind);
      
      if (data.isDelete === true) {
        if (existingRowIndex !== -1) {
          targetSheet.deleteRow(existingRowIndex);
          return createResponse({ 'result': 'success', 'message': 'Payment deleted', 'id': paymentIdToFind });
        } else {
          return createResponse({ 'result': 'error', 'message': 'Payment not found for delete' });
        }
      }
      
      rowData = new Array(headers.length).fill("");
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        switch(header) {
          case "Payment ID": rowData[j] = paymentIdToFind || uuid; break;
          case "Lead ID": rowData[j] = data.leadId || ""; break;
          case "Customer Name": rowData[j] = data.customerName || ""; break;
          case "Payment Date": rowData[j] = data.paymentDate || ""; break;
          case "Amount": rowData[j] = data.amountReceived || data.amount || 0; break;
          case "Mode": rowData[j] = data.paymentMode || data.mode || ""; break;
          case "Reference Number": rowData[j] = data.referenceNumber || ""; break;
          case "Remarks": rowData[j] = data.remarks || ""; break;
          case "Timestamp": rowData[j] = data.createdAt || data.timestamp || timestamp; break;
          case "Created By": rowData[j] = data.receivedBy || data.createdBy || ""; break;
        }
      }
    } else if (type === 'expense') {
      sheetName = CONFIG.SHEETS.EXPENSE_MASTER || "ExpenseMaster";
      var targetSheet = getOrCreateSheet(ss, sheetName);
      if (targetSheet.getLastRow() === 0) {
        var headers = ["Expense ID", "Amount", "Payment Date", "Category", "Sub-Category", "Vendor Name", "Reference Number", "Remarks", "Created By", "Created Date", "Modified By", "Modified Date"];
        setupSheetHeaders(targetSheet, headers);
      }
      var headers = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];
      var expenseIdToFind = data.expenseId || data.id;
      existingRowIndex = findRowIndexById(targetSheet, 1, expenseIdToFind);
      
      if (data.isDelete === true) {
        if (existingRowIndex !== -1) {
          targetSheet.deleteRow(existingRowIndex);
          return createResponse({ 'result': 'success', 'message': 'Expense deleted', 'id': expenseIdToFind });
        } else {
          return createResponse({ 'result': 'error', 'message': 'Expense not found for delete' });
        }
      }
      
      rowData = new Array(headers.length).fill("");
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        switch(header) {
          case "Expense ID": rowData[j] = expenseIdToFind || uuid; break;
          case "Amount": rowData[j] = data.amount || 0; break;
          case "Payment Date": rowData[j] = data.paymentDate || ""; break;
          case "Category": rowData[j] = data.category || ""; break;
          case "Sub-Category": rowData[j] = data.subCategory || ""; break;
          case "Vendor Name": rowData[j] = data.vendorName || ""; break;
          case "Reference Number": rowData[j] = data.referenceNumber || ""; break;
          case "Remarks": rowData[j] = data.remarks || ""; break;
          case "Created By": rowData[j] = data.createdBy || "agent@ghumofiroo.com"; break;
          case "Created Date": rowData[j] = data.createdDate || timestamp; break;
          case "Modified By": rowData[j] = data.modifiedBy || ""; break;
          case "Modified Date": rowData[j] = data.modifiedDate || ""; break;
        }
      }
    } else if (type === 'discussion_history') {
      sheetName = CONFIG.SHEETS.DISCUSSION_HISTORY;
      var targetSheet = ss.getSheetByName(sheetName);
      if (!targetSheet) {
        targetSheet = getOrCreateSheet(ss, sheetName);
        var headers = ["Lead ID", "Customer Name", "Discussion Type", "Remark", "Created By", "Date", "Time", "Timestamp"];
        setupSheetHeaders(targetSheet, headers);
      }
      
      var dt = new Date(data.timestamp || timestamp);
      var dateStr = Utilities.formatDate(dt, Session.getScriptTimeZone(), "dd-MMM-yyyy");
      var timeStr = Utilities.formatDate(dt, Session.getScriptTimeZone(), "hh:mm a");
      var formattedTimestamp = Utilities.formatDate(dt, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      
      rowData = [
        data.leadId || "",
        data.customerName || "",
        data.discussionType || "Discussion",
        data.remark || "",
        data.createdBy || "Agent",
        dateStr,
        timeStr,
        formattedTimestamp
      ];
    } else if (type === 'journey') {
      sheetName = CONFIG.SHEETS.LEAD_JOURNEY || "LeadJourney";
      var targetSheet = getOrCreateSheet(ss, sheetName);
      if (targetSheet.getLastRow() === 0) {
        var headers = ["Lead ID", "Stage", "Status", "Remarks", "Agent", "Timestamp"];
        setupSheetHeaders(targetSheet, headers);
      }
      var headers = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];
      
      var dt = new Date(data.timestamp || timestamp);
      var formattedTimestamp = Utilities.formatDate(dt, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      
      rowData = new Array(headers.length).fill("");
      for (var j = 0; j < headers.length; j++) {
        var header = headers[j];
        switch(header) {
          case "Lead ID": rowData[j] = data.leadId || ""; break;
          case "Stage": rowData[j] = data.stage || ""; break;
          case "Status": rowData[j] = data.status || ""; break;
          case "Remarks": rowData[j] = data.remarks || ""; break;
          case "Agent": rowData[j] = data.agent || ""; break;
          case "Timestamp": rowData[j] = formattedTimestamp; break;
        }
      }
    } else {
      throw new Error("Unknown submission type: " + type);
    }
    
    // --- APPEND OR UPDATE ROW ---
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) throw new Error("Sheet not found: " + sheetName);
    
    if (existingRowIndex !== -1) {
      sheet.getRange(existingRowIndex, 1, 1, rowData.length).setValues([rowData]);
      if (sheetName !== CONFIG.SHEETS.DISCUSSION_HISTORY && sheetName !== "LeadSourceExpenses" && sheetName !== CONFIG.SHEETS.EXPENSE_MASTER) {
        sheet.getRange(existingRowIndex, 2).setNumberFormat("yyyy-mm-dd hh:mm:ss");
      }
    } else {
      sheet.appendRow(rowData);
      if (sheetName !== CONFIG.SHEETS.DISCUSSION_HISTORY && sheetName !== "LeadSourceExpenses" && sheetName !== CONFIG.SHEETS.EXPENSE_MASTER) {
        sheet.getRange(sheet.getLastRow(), 2).setNumberFormat("yyyy-mm-dd hh:mm:ss");
      }
    }

    // Early-return for non-lead types: no email logic needed
    if (type !== 'lead') {
      return createResponse({
        'result': 'success',
        'id': data.leadId || data.id || uuid,
        'type': type
      });
    }

    // --- SEND CONFIRMATION EMAIL & UPDATE STATUS (lead type only) ---
    var emailStatus = "Pending";
    var emailSentDate = data.emailSentDate || "";
    var lastEmailSentDate = data.lastEmailSentDate || "";
    var emailSentCount = Number(data.emailSentCount || 0);
    var errorMsg = "";

    if (type === 'lead') {
      var email = data.customerEmail || data.email;
      var isResend = data.isResend === true;
      var isManualSend = data.isManualSend === true;
      
      // Determine if Lead Purchased Date = Current Date
      var isToday = false;
      if (data.leadPurchasedDate) {
        var purchasedDateStr = "";
        if (typeof data.leadPurchasedDate === 'string') {
          purchasedDateStr = data.leadPurchasedDate.split('T')[0];
        } else {
          try {
            purchasedDateStr = Utilities.formatDate(new Date(data.leadPurchasedDate), Session.getScriptTimeZone(), "yyyy-MM-dd");
          } catch(e) {}
        }
        var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
        if (purchasedDateStr === todayStr) {
          isToday = true;
        }
      }
      
      var shouldSend = (!data.isUpdate && isToday) || isManualSend || isResend;
      
      if (shouldSend) {
        if (email && email.trim() !== "") {
          try {
            var dest = Array.isArray(data.leadDestination) ? data.leadDestination.join(", ") : (data.leadDestination || data.destinations || "");
            var src = data.leadSource || data.source || "";
            var customerName = data.customerName || data.name || "Customer";
            var packageName = data.packageName || data.tourPackageName || "Custom Tour";
            var customerPhone = data.customerPhone || data.phone || "";
            
            var isBrochureRequest = data.brochureRequested === "Yes" || src === "Brochure Download" || !!data.pdfBase64;
            
            var subject = "";
            var htmlBody = "";
            var attachments = [];
            
            if (data.pdfBase64) {
              try {
                var pdfBlob = Utilities.newBlob(Utilities.base64Decode(data.pdfBase64), "application/pdf", data.pdfFileName || (dest.replace(/\s+/g, '_') + "_Brochure.pdf"));
                attachments.push(pdfBlob);
              } catch(blobErr) {
                console.error("Failed to decode PDF attachment: " + blobErr.toString());
              }
            }
            
            if (isBrochureRequest) {
              subject = getBrochureSubject(dest || packageName);
              htmlBody = getBrochureHtmlBody(customerName, dest || packageName);
            } else {
              var rawSubject = 'thank you for your inquiry' + (dest ? ' "' + dest + '"' : '') + ' as i am verified partner of "' + src + '"';
              subject = toTitleCase(rawSubject);
              htmlBody = getStandardHtmlBody(customerName, src, dest, packageName, customerPhone, data.leadId || data.id || uuid, data.tripStartDate || data.travel_date || data.travelDates || "", data.totalPaxCount || data.numberOfTravelers || "1");
            }
            
            MailApp.sendEmail({
              to: email,
              subject: subject,
              htmlBody: htmlBody,
              name: "Ghumo Firoo Travels",
              attachments: attachments
            });
            
            var adminSubject = "🚨 New Lead Alert: " + customerName + " - " + packageName;
            var adminHtmlBody = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>New Lead Alert - Ghumo Firoo Travels CRM</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f1f5f9; width: 100% !important; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 20px 0; }
    .card { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 14px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
    .hdr { background-color: #0f172a; padding: 24px 20px; text-align: center; }
    .hdr h2 { margin: 0; color: #f97316; font-size: 20px; font-weight: 800; }
    .hdr p { margin: 6px 0 0; color: #94a3b8; font-size: 13px; }
    .body { padding: 24px 20px; }
    .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 2px; }
    .value { font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word; }
    .row { padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
    .row:last-child { border-bottom: none; }
    .badge { display: inline-block; padding: 3px 10px; font-size: 11px; font-weight: 700; border-radius: 20px; background-color: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
    .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-left: 4px solid #dc2626; border-radius: 8px; padding: 14px 16px; margin-top: 20px; font-size: 13px; color: #dc2626; }
    .ftr { background-color: #0f172a; padding: 16px 20px; text-align: center; font-size: 12px; color: #94a3b8; }
    @media screen and (max-width: 600px) {
      .wrapper { padding: 0 !important; }
      .card { border-radius: 0 !important; }
      .body { padding: 18px 14px !important; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="card">
    <div class="hdr">
      <h2>🚨 New Lead Notification</h2>
      <p>A new travel inquiry has just arrived</p>
    </div>
    <div class="body">
      <div class="row"><span class="label">Lead ID</span><span class="value">${data.leadId || data.id || "—"}</span></div>
      <div class="row"><span class="label">Lead Date</span><span class="value">${data.leadPurchasedDate || "—"}</span></div>
      <div class="row"><span class="label">Customer Name</span><span class="value">${customerName}</span></div>
      <div class="row"><span class="label">Contact Number</span><span class="value">${customerPhone || "—"}</span></div>
      <div class="row"><span class="label">Email Address</span><span class="value">${email}</span></div>
      <div class="row"><span class="label">Lead Source</span><span class="value"><span class="badge">${src}</span></span></div>
      <div class="row"><span class="label">Package Interest</span><span class="value">${packageName}</span></div>
      <div class="row"><span class="label">Package Cost</span><span class="value">₹${data.packageCost || 0}</span></div>
      <div class="row"><span class="label">Assigned Agent</span><span class="value">${data.agentName || "Unassigned"}</span></div>
      <div class="row"><span class="label">Destination</span><span class="value">${dest || "—"}</span></div>
      <div class="alert-box"><strong>⚡ Action Required:</strong> Please contact this customer within 24 hours to construct their custom itinerary.</div>
    </div>
    <div class="ftr">Ghumo Firoo Travels — CRM Dashboard System</div>
  </div>
</div>
</body>
</html>`;
            
            try {
              MailApp.sendEmail({
                to: "info@ghumofiroo.com",
                subject: adminSubject,
                htmlBody: adminHtmlBody,
                name: "Ghumo Firoo CRM"
              });
            } catch(adminErr) {
              console.error("Admin notification failed: " + adminErr.toString());
            }
            
            emailStatus = "Sent";
            if (!emailSentDate) {
              emailSentDate = new Date().toISOString();
            }
            lastEmailSentDate = new Date().toISOString();
            emailSentCount += 1;
          } catch (mailErr) {
            emailStatus = "Failed";
            errorMsg = mailErr.toString();
            console.error("Gmail sending failed: " + errorMsg);
          }
        } else {
          emailStatus = "Failed";
          errorMsg = "No email address provided";
        }
      } else {
        emailStatus = "Not Sent";
      }
      
      var lastRow = (existingRowIndex !== -1) ? existingRowIndex : sheet.getLastRow();
      
      // Update Standard Email Status Columns
      var emailStatusColIdx = headers.indexOf("Email Status") + 1;
      var emailSentDateColIdx = headers.indexOf("Email Sent Date") + 1;
      var lastEmailSentDateColIdx = headers.indexOf("Last Email Sent Date") + 1;
      var emailSentCountColIdx = headers.indexOf("Email Sent Count") + 1;
      
      if (emailStatusColIdx > 0) sheet.getRange(lastRow, emailStatusColIdx).setValue(emailStatus);
      if (emailSentDateColIdx > 0 && emailSentDate) sheet.getRange(lastRow, emailSentDateColIdx).setValue(emailSentDate);
      if (lastEmailSentDateColIdx > 0 && lastEmailSentDate) sheet.getRange(lastRow, lastEmailSentDateColIdx).setValue(lastEmailSentDate);
      if (emailSentCountColIdx > 0) sheet.getRange(lastRow, emailSentCountColIdx).setValue(emailSentCount);
      
      // Update Brochure Status Columns if it was a brochure request
      var isBrochureReq = data.brochureRequested === "Yes" || (data.source || data.leadSource) === "Brochure Download" || !!data.pdfBase64;
      if (isBrochureReq) {
        var brochureRequestedColIdx = headers.indexOf("Brochure Requested") + 1;
        var brochureSentColIdx = headers.indexOf("Brochure Sent") + 1;
        var brochureSentDateColIdx = headers.indexOf("Brochure Sent Date") + 1;
        var brochureEmailStatusColIdx = headers.indexOf("Brochure Email Status") + 1;
        
        var brochureRequestedVal = "Yes";
        var brochureSentVal = (emailStatus === "Sent") ? "Yes" : "No";
        var brochureSentDateVal = (emailStatus === "Sent") ? (emailSentDate || new Date().toISOString()) : "";
        var brochureEmailStatusVal = emailStatus; // Pending, Sent, Failed
        
        if (brochureRequestedColIdx > 0) sheet.getRange(lastRow, brochureRequestedColIdx).setValue(brochureRequestedVal);
        if (brochureSentColIdx > 0) sheet.getRange(lastRow, brochureSentColIdx).setValue(brochureSentVal);
        if (brochureSentDateColIdx > 0) sheet.getRange(lastRow, brochureSentDateColIdx).setValue(brochureSentDateVal);
        if (brochureEmailStatusColIdx > 0) sheet.getRange(lastRow, brochureEmailStatusColIdx).setValue(brochureEmailStatusVal);
      }
    } else {
      try {
        sendConfirmationEmail(data, type, uuid);
      } catch (mailErr) {
        console.error("Confirmation mail failed: " + mailErr.toString());
      }
    }

    return createResponse({ 
      'result': 'success', 
      'id': data.leadId || data.id || uuid, 
      'emailStatus': emailStatus, 
      'emailSentDate': emailSentDate, 
      'lastEmailSentDate': lastEmailSentDate,
      'emailSentCount': emailSentCount,
      'errorMessage': errorMsg 
    });

  } catch (err) {
    return createResponse({ 'result': 'error', 'message': err.toString() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * OTP Handler: Send OTP
 */
function handleSendOtp(ss, data) {
  var email = data.email;
  if (!email) throw new Error("Email is required for OTP");
  
  // Generate 6 digit OTP
  var otp = Math.floor(100000 + Math.random() * 900000).toString();
  var timestamp = new Date();
  var token = generateUUID(); // Temporary token, becomes valid after verification
  
  // Store in OTPS sheet
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.OTPS);
  
  // Clean up old OTPs for this email first
  cleanOldOtps(sheet, email);
  
  sheet.appendRow([email, otp, timestamp, 0, token]);
  
  // Send Email
  try {
    MailApp.sendEmail({
      to: email,
      subject: "Your Verification Code - Ghumo Firoo Travels",
      htmlBody: "<h2>Ghumo Firoo Verification</h2><p>Your verification code is: <strong>" + otp + "</strong></p><p>This code expires in 5 minutes.</p>"
    });
  } catch (e) {
    // If quota exceeded or error
    console.error("Mail Error: " + e.toString());
    throw new Error("Failed to send email. Please try again later.");
  }
  
  return createResponse({ 'result': 'success', 'message': 'OTP sent to ' + email });
}

/**
 * OTP Handler: Verify OTP
 */
function handleVerifyOtp(ss, data) {
  var email = data.email;
  var userOtp = data.otp;
  
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.OTPS);
  var rows = sheet.getDataRange().getValues();
  
  // Find latest OTP for this email
  var rowIndex = -1;
  var latestTime = 0;
  
  for (var i = 1; i < rows.length; i++) {
    if (rows[i][0] == email) {
      var t = new Date(rows[i][2]).getTime();
      if (t > latestTime) {
        latestTime = t;
        rowIndex = i;
      }
    }
  }
  
  if (rowIndex === -1) throw new Error("No OTP found for this email. Request a new one.");
  
  var storedOtp = rows[rowIndex][1];
  var timestamp = new Date(rows[rowIndex][2]);
  var attempts = rows[rowIndex][3];
  var token = rows[rowIndex][4];
  
  // Check Expiry (5 mins)
  var now = new Date();
  var diffMins = (now - timestamp) / 60000;
  
  if (diffMins > CONFIG.OTP_EXPIRY_MINUTES) {
    return createResponse({ 'result': 'error', 'message': 'OTP expired' });
  }
  
  if (attempts >= CONFIG.MAX_OTP_ATTEMPTS) {
    return createResponse({ 'result': 'error', 'message': 'Too many failed attempts. Request a new OTP.' });
  }
  
  if (String(storedOtp) === String(userOtp)) {
    // Success - clean up and return token
    sheet.deleteRow(rowIndex + 1);
    
    // Store verified token
    var verifiedSheet = getOrCreateSheet(ss, CONFIG.SHEETS.VERIFIED_TOKENS);
    verifiedSheet.appendRow([token, email, new Date(), "False"]);
    
    return createResponse({ 'result': 'success', 'token': token }); // Token can be used for final submission proof
  } else {
    // Increment attempts
    sheet.getRange(rowIndex + 1, 4).setValue(attempts + 1);
    return createResponse({ 'result': 'error', 'message': 'Invalid OTP' });
  }
}

function cleanOldOtps(sheet, email) {
  var rows = sheet.getDataRange().getValues();
  // Loop backwards to delete safely
  for (var i = rows.length - 1; i >= 1; i--) {
    if (rows[i][0] == email) {
      sheet.deleteRow(i + 1);
    }
  }
}

function isValidToken(ss, email, token) {
  var sheet = ss.getSheetByName(CONFIG.SHEETS.VERIFIED_TOKENS);
  if (!sheet) return false;
  
  var data = sheet.getDataRange().getValues();
  
  // Check against verified tokens
  for (var i = 1; i < data.length; i++) {
    var rowToken = data[i][0];
    var rowEmail = data[i][1];
    var isUsed = data[i][3];
    
    if (rowToken === token && rowEmail === email) {
      if (String(isUsed) === "True") {
        return false; // Already used
      }
      // Mark as used
      sheet.getRange(i + 1, 4).setValue("True");
      return true;
    }
  }
  return false; 
}

/**
 * API: doOptions
 * Handles CORS preflight requests
 */
function doOptions(e) {
  return ContentService.createTextOutput("")
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * API: doGet
 * Allows fetching data from the sheet (for Admin Panel)
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var type = e.parameter.type;
  var data = [];
  
  if (type) {
    var sheetName;
    switch(type) {
      case 'leads': sheetName = CONFIG.SHEETS.LEADS; break;
      case 'bookings': sheetName = CONFIG.SHEETS.BOOKINGS; break;
      case 'enquiries': sheetName = CONFIG.SHEETS.ENQUIRIES; break;
      case 'contact': sheetName = CONFIG.SHEETS.CONTACT; break;
      case 'newsletter': sheetName = CONFIG.SHEETS.NEWSLETTER; break;
      case 'dashboard': sheetName = CONFIG.SHEETS.DASHBOARD; break;
    }
    
    if (sheetName) {
      var sheet = ss.getSheetByName(sheetName);
      if (sheet) {
        var rows = sheet.getDataRange().getValues();
        var headers = rows[0];
        for (var i = 1; i < rows.length; i++) {
          var row = rows[i];
          var obj = {};
          for (var j = 0; j < headers.length; j++) {
            obj[headers[j]] = row[j];
          }
          data.push(obj);
        }
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- HELPER FUNCTIONS ---

function getOrCreateSheet(ss, name) {
  var sheet = ss.getSheetByName(name);
  return sheet ? sheet : ss.insertSheet(name);
}

function setupSheetHeaders(sheet, headers) {
  var range = sheet.getRange(1, 1, 1, headers.length);
  range.setValues([headers]);
  range.setFontWeight(CONFIG.HEADER_FONT_WEIGHT).setBackground(CONFIG.HEADER_COLOR);
  sheet.setFrozenRows(1);
}

function setColumnValues(sheet, col, values) {
  var rows = values.map(v => [v]);
  if (rows.length > 0) sheet.getRange(2, col, rows.length, 1).setValues(rows);
}

function setValidation(sheet, col, rule, formula, helpText) {
  var range = sheet.getRange(2, col, sheet.getMaxRows()-1, 1);
  if (rule) {
    range.setDataValidation(rule);
  } else if (formula) {
    var r = SpreadsheetApp.newDataValidation().requireFormulaSatisfied(formula).setAllowInvalid(false);
    if (helpText) r.setHelpText(helpText);
    range.setDataValidation(r.build());
  }
}

function checkDuplicate(sheet, colIndex, value) {
  if (!value) return false;
  var data = sheet.getDataRange().getValues();
  // Start from row 1 (index 1) to skip header
  for (var i = 1; i < data.length; i++) {
    if (data[i][colIndex-1] == value) {
      return true;
    }
  }
  return false;
}

function checkCompositeDuplicate(sheet, email, phone, emailCol, phoneCol) {
  if (!sheet) return false;
  var data = sheet.getDataRange().getValues();
  // Start from row 1 to skip header
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rowEmail = row[emailCol - 1];
    var rowPhone = row[phoneCol - 1];
    
    // Check if Email matches (if provided)
    var emailMatch = !email || (rowEmail && String(rowEmail).toLowerCase() === String(email).toLowerCase());
    // Check if Phone matches (if provided)
    var phoneMatch = !phone || (rowPhone && String(rowPhone) === String(phone));
    
    // If both match (or are null/ignored), it's a duplicate
    // We require at least one of them to be present to consider it a duplicate check
    if ((email || phone) && emailMatch && phoneMatch) {
      return true;
    }
  }
  return false;
}

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function setupTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) ScriptApp.deleteTrigger(triggers[i]);
  ScriptApp.newTrigger('createWeeklyBackup').timeBased().everyWeeks(1).onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(1).create();
}

function createWeeklyBackup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd");
  var folder = DriveApp.getFoldersByName(CONFIG.BACKUP_FOLDER_NAME).hasNext() ? DriveApp.getFoldersByName(CONFIG.BACKUP_FOLDER_NAME).next() : DriveApp.createFolder(CONFIG.BACKUP_FOLDER_NAME);
  DriveApp.getFileById(ss.getId()).makeCopy(CONFIG.FILENAME + " Backup " + timestamp, folder);
}

/**
 * Sends professional HTML confirmation emails based on submission type
 */
function sendConfirmationEmail(data, type, id) {
  var email = data.email || data.emailAddress;
  if (!email) return;

  var subject = "";
  var body = "";
  var name = data.name || data.firstName || "Traveler";
  var packageTitle = data.package_interest || (data.packageData ? data.packageData.title : "") || data.packageType || "Your Trip";

  if (type === 'booking') {
    subject = "Booking Received: " + packageTitle + " - Ghumo Firoo Travels";
    body = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #ea580c;">Booking Request Received! 🎉</h2>
        <p>Hi ${name},</p>
        <p>Thank you for choosing <strong>Ghumo Firoo Travels</strong>. We have received your booking request for <strong>${packageTitle}</strong>.</p>
        
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Booking ID:</strong> ${data.bookingId || id}</p>
          <p style="margin: 5px 0 0;"><strong>Package:</strong> ${packageTitle}</p>
          <p style="margin: 5px 0 0;"><strong>Status:</strong> Payment Pending</p>
        </div>

        <p>To finalize your reservation, please ensure you have completed the payment as per the instructions on the website. Once payment is verified, our team will issue your official confirmation voucher.</p>
        
        <p><strong>Need Help?</strong> Reply to this email or call us at +91 99109 87264.</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} Ghumo Firoo Travels. Your Journey, Our Expertise.</p>
      </div>
    `;
  } else if (type === 'enquiry' || type === 'lead') {
    subject = "Trip Enquiry Received - " + packageTitle;
    body = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #0f172a;">Plan Your Dream Trip ✈️</h2>
        <p>Hi ${name},</p>
        <p>We've received your interest in <strong>${packageTitle}</strong>. Our travel experts are already working on the best itinerary for you.</p>
        
        <p><strong>What's Next?</strong></p>
        <ul>
          <li>A dedicated travel consultant will call you within 24 hours.</li>
          <li>We will share a personalized quote and itinerary.</li>
          <li>You can customize everything to your preference.</li>
        </ul>
        
        <p>If you have any urgent questions, feel free to call us at +91 99109 87264.</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="font-size: 12px; color: #64748b; text-align: center;">© ${new Date().getFullYear()} Ghumo Firoo Travels.</p>
      </div>
    `;
  }

  if (subject && body) {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      htmlBody: body,
      name: "Ghumo Firoo Travels"
    });
  }
}

function createResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function toTitleCase(str) {
  if (!str) return "";
  return str.replace(/\b\w/g, function(char) {
    return char.toUpperCase();
  });
}

function getBrochureSubject(destination) {
  var d = (destination || "").toLowerCase();
  if (d.indexOf("europe") !== -1) {
    return "📍 Your Europe Travel Brochure Is Ready";
  } else if (d.indexOf("dubai") !== -1) {
    return "🏙️ Dubai Luxury Travel Brochure Inside";
  } else if (d.indexOf("bali") !== -1) {
    return "🌴 Your Bali Escape Guide Is Ready";
  } else if (d.indexOf("char dham") !== -1 || d.indexOf("chardham") !== -1) {
    return "🏔️ Char Dham Yatra Brochure & Travel Guide";
  } else {
    return toTitleCase("✈️ Your Dream " + (destination || "Travel") + " Holiday Starts Here");
  }
}

function getBrochureBanner(destination) {
  var d = (destination || "").toLowerCase();
  if (d.indexOf("char dham") !== -1 || d.indexOf("chardham") !== -1 || d.indexOf("kedarnath") !== -1 || d.indexOf("badrinath") !== -1 || d.indexOf("yamunotri") !== -1 || d.indexOf("gangotri") !== -1) {
    return "https://ghumofiroo.com/chardham-by-helicopter.jpg";
  } else if (d.indexOf("rann") !== -1 || d.indexOf("utsav") !== -1 || d.indexOf("kutch") !== -1) {
    return "https://ghumofiroo.com/Rann-Utsav-Gujarat.png";
  } else if (d.indexOf("bali") !== -1) {
    return "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("dubai") !== -1) {
    return "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("europe") !== -1) {
    return "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("kashmir") !== -1) {
    return "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("ladakh") !== -1 || d.indexOf("leh") !== -1) {
    return "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("goa") !== -1) {
    return "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("georgia") !== -1) {
    return "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("kerala") !== -1) {
    return "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("singapore") !== -1) {
    return "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("thailand") !== -1) {
    return "https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("japan") !== -1) {
    return "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("rajasthan") !== -1 || d.indexOf("jaisalmer") !== -1 || d.indexOf("jaipur") !== -1 || d.indexOf("udaipur") !== -1) {
    return "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("turkey") !== -1) {
    return "https://images.unsplash.com/photo-1524230572899-a752b3835840?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("himachal") !== -1 || d.indexOf("manali") !== -1 || d.indexOf("shimla") !== -1) {
    return "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("mauritius") !== -1) {
    return "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("seychelles") !== -1) {
    return "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80";
  } else if (d.indexOf("golden") !== -1 || d.indexOf("triangle") !== -1) {
    return "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1200&q=80";
  } else {
    return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80";
  }
}

function getBrochureHtmlBody(customerName, dest) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Your Brochure - Ghumo Firoo Travels</title>
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; background-color: #f1f5f9; width: 100% !important; }
    .wrapper { width: 100%; background-color: #f1f5f9; padding: 20px 0; }
    .container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
    .logo-block { background-color: #ffffff; text-align: center; padding: 28px 24px 18px 24px; }
    .logo-img { max-height: 64px; width: auto; display: inline-block; }
    .hero-banner { width: 100%; height: 250px; object-fit: cover; display: block; }
    .content { padding: 32px 24px; }
    .greeting { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 700; color: #1e293b; margin: 0 0 16px 0; }
    .body-text { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 24px 0; }
    .feature-list { list-style: none; padding: 0; margin: 0 0 24px 0; }
    .feature-item { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px; color: #1e293b; font-weight: 600; padding: 8px 0; border-bottom: 1px solid #f1f5f9; display: flex; align-items: center; }
    .feature-check { color: #ea580c; font-weight: bold; margin-right: 12px; font-size: 16px; }
    .ctas { text-align: center; padding: 10px 0 24px 0; }
    .cta-btn { display: block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff !important; text-decoration: none; padding: 14px 24px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.5px; box-shadow: 0 6px 20px rgba(234,88,12,0.3); margin: 10px auto; max-width: 250px; text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .cta-btn-secondary { display: block; background: #ffffff; border: 2px solid #ea580c; color: #ea580c !important; text-decoration: none; padding: 12px 24px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.5px; margin: 10px auto; max-width: 250px; text-align: center; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    .contact-sec { background-color: #f8fafc; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px; border: 1px solid #e2e8f0; }
    .contact-title { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .contact-link { color: #1e293b !important; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; margin: 0 10px; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
    
    /* Unified Footer Block */
    .footer-block { background-color: #0f172a; padding: 32px 24px; text-align: center; }
    .footer-brand { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0; letter-spacing: 0.5px; }
    .footer-tagline { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #f97316; font-style: italic; margin: 0 0 16px 0; }
    .footer-divider { height: 1px; background-color: #1e293b; margin: 16px 0; }
    .footer-contact { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.8; }
    .footer-link { color: #f97316 !important; text-decoration: none; font-weight: 600; }
    
    @media screen and (max-width: 600px) {
      .wrapper { padding: 10px 0 !important; }
      .container { border-radius: 0 !important; }
      .logo-block { padding: 20px 16px 12px !important; }
      .content { padding: 24px 16px !important; }
      .cta-btn, .cta-btn-secondary { max-width: 100% !important; }
    }
  </style>
</head>
<body>
<div class="wrapper">
  <div class="container">
    <!-- LOGO -->
    <div class="logo-block">
      <img src="https://ghumofiroo.com/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" class="logo-img" />
    </div>

    <!-- HERO BANNER -->
    <img src="${getBrochureBanner(dest)}" alt="${dest} Brochure" class="hero-banner" />

    <!-- CONTENT -->
    <div class="content">
      <p class="greeting">Dear ${customerName},</p>
      <p class="body-text">
        Thank you for your interest in <strong style="color: #ea580c;">${dest}</strong>! We are delighted to share our exclusive travel brochure containing all the details for your upcoming dream holiday.
      </p>
      <p class="body-text" style="font-weight: bold; color: #1e293b; margin-bottom: 10px;">Inside Your Brochure, You Will Find:</p>
      <ul class="feature-list" style="margin-bottom: 24px;">
        <li class="feature-item" style="border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;"><strong style="color:#ea580c; margin-right:10px;">✓</strong> Package Highlights</li>
        <li class="feature-item" style="border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;"><strong style="color:#ea580c; margin-right:10px;">✓</strong> Day Wise Itinerary</li>
        <li class="feature-item" style="border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;"><strong style="color:#ea580c; margin-right:10px;">✓</strong> Hotel Options</li>
        <li class="feature-item" style="border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;"><strong style="color:#ea580c; margin-right:10px;">✓</strong> Sightseeing Information</li>
        <li class="feature-item" style="border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;"><strong style="color:#ea580c; margin-right:10px;">✓</strong> Travel Tips & Best Travel Season</li>
        <li class="feature-item" style="border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;"><strong style="color:#ea580c; margin-right:10px;">✓</strong> Pricing Guidance & Exclusions</li>
        <li class="feature-item" style="border-bottom: 1px solid #f1f5f9; padding: 8px 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 14px;"><strong style="color:#ea580c; margin-right:10px;">✓</strong> Frequently Asked Questions</li>
      </ul>

      <p class="body-text">
        Your travel brochure PDF is attached directly to this email. Our expert travel consultant may contact you shortly to assist with personalized recommendations and help tailor this itinerary to your specific needs.
      </p>

      <!-- CTAS -->
      <div class="ctas">
        <a href="https://wa.me/919910987264" class="cta-btn" target="_blank"> Speak To Travel Expert</a>
        <a href="https://ghumofiroo.com/custom-tour-packages" class="cta-btn-secondary" target="_blank">Request Custom Quote</a>
        <a href="https://ghumofiroo.com/packages" class="cta-btn-secondary" target="_blank">View More Packages</a>
      </div>

      <!-- CONTACT SECTION -->
      <div class="contact-sec">
        <div class="contact-title">Connect with Us Directly</div>
        <a href="tel:+919910987264" class="contact-link">📞 +91 99109 87264</a>
        <a href="mailto:info@ghumofiroo.com" class="contact-link">✉️ info@ghumofiroo.com</a>
      </div>
    </div>

    <!-- FOOTER -->
    <div class="footer-block">
      <p class="footer-brand">✦ Ghumo Firoo Travels ✦</p>
      <p class="footer-tagline">Where Dreams Become Itineraries</p>
      <div class="footer-divider"></div>
      <p class="footer-contact">
        📞 <a href="tel:+919910987264" class="footer-link">+91 99109 87264</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        📧 <a href="mailto:info@ghumofiroo.com" class="footer-link">info@ghumofiroo.com</a>
      </p>
      <p class="footer-contact">
        🌐 <a href="https://ghumofiroo.com" class="footer-link" target="_blank">www.ghumofiroo.com</a>
      </p>
      <div class="footer-divider"></div>
      
      <!-- Social Media Section -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 15px; margin-bottom: 15px;">
        <tr>
          <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
            <a href="https://www.facebook.com/ghumofirootravels" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="https://img.icons8.com/color/48/facebook-new.png" width="24" height="24" alt="Facebook" style="display: block; margin: 0 auto 6px auto; border: 0;" />
              <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">facebook.com/ghumofirootravels</span>
            </a>
          </td>
          <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
            <a href="https://www.instagram.com/ghumofirootravels/" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="https://img.icons8.com/color/48/instagram-new.png" width="24" height="24" alt="Instagram" style="display: block; margin: 0 auto 6px auto; border: 0;" />
              <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">instagram.com/ghumofirootravels</span>
            </a>
          </td>
          <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
            <a href="https://x.com/GhumoFiroo" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="https://img.icons8.com/color/48/twitterx.png" width="24" height="24" alt="Twitter/X" style="display: block; margin: 0 auto 6px auto; border: 0;" />
              <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">x.com/GhumoFiroo</span>
            </a>
          </td>
        </tr>
      </table>

      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #64748b; margin-top: 15px;">
        © ${new Date().getFullYear()} GHUMO FIROO TRAVELS • ALL RIGHTS RESERVED
      </div>
    </div>
  </div>
</div>
</body>
</html>`;
}

function getStandardHtmlBody(customerName, src, dest, packageName, customerPhone, leadId, tripStartDate, totalPax) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>Ghumo Firoo Travels - Travel Inquiry</title>
  <style type="text/css">
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    /* General */
    body { margin: 0 !important; padding: 0 !important; background-color: #f1f5f9; width: 100% !important; }
    .email-wrapper { width: 100%; background-color: #f1f5f9; padding: 20px 0; }
    .email-container { max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 8px 30px rgba(0,0,0,0.08); }
    /* Logo */
    .logo-block { background-color: #ffffff; text-align: center; padding: 28px 24px 18px 24px; }
    .logo-img { max-height: 64px; width: auto; display: inline-block; }
    /* Hero Banner */
    .hero-banner { width: 100%; height: 250px; object-fit: cover; display: block; }
    /* Content */
    .content-block { padding: 28px 24px; }
    .greeting { font-size: 17px; font-weight: 700; color: #1e293b; margin: 0 0 14px 0; }
    .body-text { font-size: 14px; color: #475569; line-height: 1.7; margin: 0 0 20px 0; }
    /* Inquiry Card */
    .inquiry-card { background-color: #fff7ed; border: 1px solid #fed7aa; border-left: 4px solid #ea580c; border-radius: 10px; padding: 20px; margin: 20px 0; }
    .inquiry-card-title { font-size: 12px; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 16px 0; }
    /* Detail Rows — stacked instead of side-by-side */
    .detail-row { padding: 10px 0; border-bottom: 1px solid #fde8d0; }
    .detail-row:last-child { border-bottom: none; padding-bottom: 0; }
    .detail-label { font-size: 11px; font-weight: 700; color: #9a3412; text-transform: uppercase; letter-spacing: 0.5px; display: block; margin-bottom: 3px; }
    .detail-value { font-size: 14px; font-weight: 600; color: #1e293b; display: block; word-break: break-word; }
    /* CTA */
    .cta-block { text-align: center; padding: 20px 0 10px 0; }
    .cta-btn { display: inline-block; background: linear-gradient(135deg, #ea580c, #f97316); color: #ffffff !important; text-decoration: none; padding: 14px 36px; font-weight: 800; border-radius: 50px; font-size: 14px; letter-spacing: 0.3px; box-shadow: 0 6px 20px rgba(234,88,12,0.35); }
    /* Sign-off */
    .signoff { font-size: 14px; color: #475569; margin: 20px 0 0 0; }
    .signoff-name { font-size: 15px; font-weight: 800; color: #ea580c; margin: 6px 0 0 0; }
    
    /* Unified Footer Block */
    .footer-block { background-color: #0f172a; padding: 32px 24px; text-align: center; }
    .footer-brand { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 800; color: #ffffff; margin: 0 0 4px 0; letter-spacing: 0.5px; }
    .footer-tagline { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #f97316; font-style: italic; margin: 0 0 16px 0; }
    .footer-divider { height: 1px; background-color: #1e293b; margin: 16px 0; }
    .footer-contact { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.8; }
    .footer-link { color: #f97316 !important; text-decoration: none; font-weight: 600; }
    
    /* Mobile */
    @media screen and (max-width: 600px) {
      .email-wrapper { padding: 10px 0 !important; }
      .email-container { border-radius: 0 !important; }
      .logo-block { padding: 20px 16px 12px !important; }
      .content-block { padding: 20px 16px !important; }
      .inquiry-card { padding: 16px !important; }
      .cta-btn { padding: 13px 28px !important; font-size: 13px !important; display: block !important; text-align: center !important; }
    }
  </style>
</head>
<body>
<div class="email-wrapper">
  <div class="email-container">

    <!-- LOGO -->
    <div class="logo-block">
      <img src="https://ghumofiroo.com/ghumo-firoo-logo.png" alt="Ghumo Firoo Travels" class="logo-img" />
    </div>

    <!-- HERO BANNER -->
    <img src="${getBrochureBanner(dest || packageName)}" alt="${dest || packageName} Banner" class="hero-banner" />

    <!-- BODY CONTENT -->
    <div class="content-block">
      <p class="greeting">Dear ${customerName},</p>
      <p class="body-text">
        Thank you for choosing <strong style="color:#ea580c;">Ghumo Firoo Travels</strong>!
        We are thrilled to assist you in planning your next escape. As a verified partner of
        <strong>${src}</strong>, we are dedicated to crafting an exceptional travel experience
        customized just for you.
      </p>

      <!-- INQUIRY CARD -->
      <div class="inquiry-card">
        <p class="inquiry-card-title">📋 Inquiry Details</p>

        <div class="detail-row">
          <span class="detail-label">Lead ID</span>
          <span class="detail-value">${leadId}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Destination</span>
          <span class="detail-value">${dest || "To be confirmed"}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Package Interest</span>
          <span class="detail-value">${packageName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Travel Date</span>
          <span class="detail-value">${tripStartDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Travelers</span>
          <span class="detail-value">${totalPax} Pax</span>
        </div>
      </div>

      <p class="body-text">
        Our travel specialist is currently tailoring recommendations matching your preferences.
        We will connect with you within <strong>24 hours</strong> with custom itineraries and pricing.
      </p>

      <!-- CTA BUTTON -->
      <div class="cta-block">
        <a href="https://ghumofiroo.com" class="cta-btn" target="_blank">✈️ View Travel Details</a>
      </div>

      <p class="signoff">Warm regards,</p>
      <p class="signoff-name">Ghumo Firoo Travels Team</p>
    </div>

    <!-- FOOTER -->
    <div class="footer-block">
      <p class="footer-brand">✦ Ghumo Firoo Travels ✦</p>
      <p class="footer-tagline">Where Dreams Become Itineraries</p>
      <div class="footer-divider"></div>
      <p class="footer-contact">
        📞 <a href="tel:+919910987264" class="footer-link">+91 99109 87264</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;
        📧 <a href="mailto:info@ghumofiroo.com" class="footer-link">info@ghumofiroo.com</a>
      </p>
      <p class="footer-contact">
        🌐 <a href="https://ghumofiroo.com" class="footer-link" target="_blank">www.ghumofiroo.com</a>
      </p>
      <div class="footer-divider"></div>
      
      <!-- Social Media Section -->
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 15px; margin-bottom: 15px;">
        <tr>
          <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
            <a href="https://www.facebook.com/ghumofirootravels" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="https://img.icons8.com/color/48/facebook-new.png" width="24" height="24" alt="Facebook" style="display: block; margin: 0 auto 6px auto; border: 0;" />
              <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">facebook.com/ghumofirootravels</span>
            </a>
          </td>
          <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
            <a href="https://www.instagram.com/ghumofirootravels/" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="https://img.icons8.com/color/48/instagram-new.png" width="24" height="24" alt="Instagram" style="display: block; margin: 0 auto 6px auto; border: 0;" />
              <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">instagram.com/ghumofirootravels</span>
            </a>
          </td>
          <td align="center" valign="top" style="padding: 0 5px; width: 33.33%;">
            <a href="https://x.com/GhumoFiroo" target="_blank" style="text-decoration: none; display: inline-block;">
              <img src="https://img.icons8.com/color/48/twitterx.png" width="24" height="24" alt="Twitter/X" style="display: block; margin: 0 auto 6px auto; border: 0;" />
              <span style="font-size: 10px; color: #94a3b8; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; display: block; line-height: 1.2; word-break: break-word;">x.com/GhumoFiroo</span>
            </a>
          </td>
        </tr>
      </table>

      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 10px; color: #64748b; margin-top: 15px;">
        © ${new Date().getFullYear()} GHUMO FIROO TRAVELS • ALL RIGHTS RESERVED
      </div>
    </div>

  </div>
</div>
</body>
</html>`;
}

function createBookingPaymentsSheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.BOOKING_PAYMENTS || "BookingPayments");
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Payment ID", "Lead ID", "Customer Name", "Payment Date", "Amount", "Mode", 
      "Reference Number", "Remarks", "Timestamp", "Created By"
    ];
    setupSheetHeaders(sheet, headers);
  }
}

function createExpenseMasterSheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.EXPENSE_MASTER || "ExpenseMaster");
  if (sheet.getLastRow() === 0) {
    var headers = [
      "Expense ID", "Amount", "Payment Date", "Category", "Sub-Category", 
      "Vendor Name", "Reference Number", "Remarks", "Created By", "Created Date", 
      "Modified By", "Modified Date"
    ];
    setupSheetHeaders(sheet, headers);
  }
}

function createLeadJourneySheet(ss) {
  var sheet = getOrCreateSheet(ss, CONFIG.SHEETS.LEAD_JOURNEY || "LeadJourney");
  if (sheet.getLastRow() === 0) {
    var headers = ["Lead ID", "Stage", "Status", "Remarks", "Agent", "Timestamp"];
    setupSheetHeaders(sheet, headers);
  }
}

function findRowIndexById(sheet, idColIndex, idValue) {
  if (!idValue) return -1;
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return -1;
  var values = sheet.getRange(2, idColIndex, lastRow - 1, 1).getValues();
  var targetVal = String(idValue).trim().toLowerCase();
  for (var i = 0; i < values.length; i++) {
    if (String(values[i][0]).trim().toLowerCase() === targetVal) {
      return i + 2; // 1-based, plus 1 to skip header
    }
  }
  return -1;
}

