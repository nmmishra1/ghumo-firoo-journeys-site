/**
 * Voucher & Invoice Service — Ghumo Firoo Journeys
 * Generates GST Invoices, Hotel Vouchers, Cab/Transport Vouchers, and Activity Passes
 */

import jsPDF from 'jspdf';

export interface InvoiceData {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerAddress?: string;
  destination: string;
  travelDates: string;
  adults: number;
  children: number;
  packageTitle: string;
  baseAmount: number;
  gstRatePercent: number; // e.g. 5% (CGST 2.5% + SGST 2.5%)
  gstAmount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  paymentMode?: string;
  transactionRef?: string;
}

export interface HotelVoucherData {
  voucherNumber: string;
  bookingDate: string;
  guestName: string;
  guestPhone: string;
  hotelName: string;
  hotelAddress: string;
  city: string;
  roomCategory: string;
  mealPlan: string; // EP, CP, MAP, AP
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomsCount: number;
  confirmationNumber?: string;
  specialInstructions?: string;
}

export interface CabVoucherData {
  voucherNumber: string;
  bookingDate: string;
  guestName: string;
  guestPhone: string;
  pickupDate: string;
  pickupTime: string;
  pickupLocation: string;
  dropLocation: string;
  vehicleType: string; // Dzire, Innova, Tempo Traveller
  vendorName: string;
  driverName?: string;
  driverPhone?: string;
  vehicleNumber?: string;
  inclusions: string[];
}

export interface ActivityVoucherData {
  voucherNumber: string;
  bookingDate: string;
  guestName: string;
  guestPhone: string;
  activityName: string;
  location: string;
  city: string;
  activityDate: string;
  timeSlot?: string;
  adultsCount: number;
  childrenCount: number;
  supplierContact?: string;
}

const BRAND_NAVY = [30, 58, 138]; // #1e3a8a
const BRAND_GOLD = [217, 119, 6];  // #d97706
const BRAND_DARK = [30, 41, 59];   // #1e293b
const BRAND_LIGHT = [248, 250, 252]; // #f8fafc

/**
 * Generate GST Tax Invoice PDF
 */
export function generateInvoicePDF(data: InvoiceData): jsPDF {
  const doc = new jsPDF();

  // Header Background
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(0, 0, 210, 40, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GHUMO FIROO TRAVELS', 14, 20);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Premium Tour Packages & Customized Travels', 14, 28);
  doc.text('GSTIN: 05AAAAA0000A1Z5 | Support: +91 99109 87264 / +91 98702 29792', 14, 34);

  // Document Title
  doc.setFontSize(16);
  doc.setTextColor(BRAND_GOLD[0], BRAND_GOLD[1], BRAND_GOLD[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('TAX INVOICE', 145, 22);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${data.invoiceNumber}`, 145, 29);
  doc.text(`Date: ${data.invoiceDate}`, 145, 34);

  // Customer Details Block
  doc.setFillColor(BRAND_LIGHT[0], BRAND_LIGHT[1], BRAND_LIGHT[2]);
  doc.rect(14, 48, 182, 32, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 48, 182, 32, 'S');

  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Billed To (Customer Details):', 18, 56);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Name: ${data.customerName}`, 18, 63);
  doc.text(`Phone: ${data.customerPhone || 'N/A'}`, 18, 69);
  doc.text(`Email: ${data.customerEmail || 'N/A'}`, 18, 74);

  doc.text(`Destination: ${data.destination}`, 115, 63);
  doc.text(`Travel Dates: ${data.travelDates}`, 115, 69);
  doc.text(`Travelers: ${data.adults} Adults, ${data.children} Children`, 115, 74);

  // Line Items Table Header
  let startY = 88;
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(14, startY, 182, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 18, startY + 5.5);
  doc.text('Qty', 120, startY + 5.5);
  doc.text('Rate (INR)', 145, startY + 5.5);
  doc.text('Amount (INR)', 170, startY + 5.5);

  // Line Item Row
  startY += 8;
  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.setFont('helvetica', 'normal');
  doc.rect(14, startY, 182, 12, 'S');
  doc.text(data.packageTitle, 18, startY + 7);
  doc.text('1', 122, startY + 7);
  doc.text(data.baseAmount.toLocaleString('en-IN'), 145, startY + 7);
  doc.text(data.baseAmount.toLocaleString('en-IN'), 170, startY + 7);

  // Summary Totals Table
  startY += 18;
  const summaryX = 115;
  
  doc.setFontSize(9);
  doc.text('Subtotal:', summaryX, startY);
  doc.text(`Rs. ${data.baseAmount.toLocaleString('en-IN')}`, 170, startY);

  startY += 6;
  const cgst = data.gstAmount / 2;
  doc.text('CGST (2.5%):', summaryX, startY);
  doc.text(`Rs. ${cgst.toLocaleString('en-IN')}`, 170, startY);

  startY += 6;
  doc.text('SGST (2.5%):', summaryX, startY);
  doc.text(`Rs. ${cgst.toLocaleString('en-IN')}`, 170, startY);

  startY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('Total Invoice Amount:', summaryX, startY);
  doc.text(`Rs. ${data.totalAmount.toLocaleString('en-IN')}`, 170, startY);

  startY += 8;
  doc.setFontSize(9);
  doc.setTextColor(34, 197, 94); // Green
  doc.text('Amount Received:', summaryX, startY);
  doc.text(`Rs. ${data.amountPaid.toLocaleString('en-IN')}`, 170, startY);

  startY += 6;
  doc.setTextColor(225, 29, 72); // Red
  doc.text('Balance Due:', summaryX, startY);
  doc.text(`Rs. ${data.balanceDue.toLocaleString('en-IN')}`, 170, startY);

  // Bank & Payment Details Block
  startY += 16;
  doc.setFillColor(BRAND_LIGHT[0], BRAND_LIGHT[1], BRAND_LIGHT[2]);
  doc.rect(14, startY, 182, 30, 'F');
  doc.rect(14, startY, 182, 30, 'S');

  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Bank Transfer Details for Payment:', 18, startY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text('Account Name: Ghumo Firoo Travels Pvt Ltd', 18, startY + 13);
  doc.text('Bank Name: HDFC Bank Ltd | Branch: Dehradun Main', 18, startY + 19);
  doc.text('Account No: 50200012345678 | IFSC Code: HDFC0000123', 18, startY + 25);

  // Footer / Terms
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Terms: All payments are subject to cancellation terms. E & O.E.', 14, 280);
  doc.text('Authorized Signatory — Ghumo Firoo Travels', 140, 280);

  return doc;
}

/**
 * Generate Hotel Confirmation Voucher PDF
 */
export function generateHotelVoucherPDF(data: HotelVoucherData): jsPDF {
  const doc = new jsPDF();

  // Header Background
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(0, 0, 210, 36, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('HOTEL CONFIRMATION VOUCHER', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ghumo Firoo Travels | Support: +91 99109 87264 / +91 98702 29792', 14, 27);

  doc.text(`Voucher #: ${data.voucherNumber}`, 145, 18);
  doc.text(`Date: ${data.bookingDate}`, 145, 25);

  // Hotel Info Box
  doc.setFillColor(BRAND_LIGHT[0], BRAND_LIGHT[1], BRAND_LIGHT[2]);
  doc.rect(14, 44, 182, 32, 'F');
  doc.rect(14, 44, 182, 32, 'S');

  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(data.hotelName, 18, 53);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`City: ${data.city}`, 18, 60);
  doc.text(`Address: ${data.hotelAddress}`, 18, 66);
  doc.text(`Confirmation #: ${data.confirmationNumber || 'CONFIRMED'}`, 18, 71);

  // Guest & Stay Table
  let y = 84;
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Guest Name', 18, y + 5.5);
  doc.text('Check-In', 70, y + 5.5);
  doc.text('Check-Out', 105, y + 5.5);
  doc.text('Room Category', 140, y + 5.5);
  doc.text('Plan', 180, y + 5.5);

  y += 8;
  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.setFont('helvetica', 'normal');
  doc.rect(14, y, 182, 14, 'S');
  doc.text(data.guestName, 18, y + 8);
  doc.text(data.checkInDate, 70, y + 8);
  doc.text(data.checkOutDate, 105, y + 8);
  doc.text(data.roomCategory, 140, y + 8);
  doc.text(data.mealPlan, 180, y + 8);

  // Special Instructions
  y += 22;
  doc.setFont('helvetica', 'bold');
  doc.text('Important Instructions:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  y += 6;
  doc.text('1. Standard check-in time is 12:00 PM and check-out time is 10:00 AM.', 14, y);
  y += 5;
  doc.text('2. Government issued photo ID is mandatory for all guests during check-in.', 14, y);
  y += 5;
  doc.text(`3. Special Note: ${data.specialInstructions || 'Direct payment for personal extras at hotel.'}`, 14, y);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Ghumo Firoo Journeys — Hotel Partner Voucher', 14, 280);

  return doc;
}

/**
 * Generate Cab / Transport Confirmation Voucher PDF
 */
export function generateCabVoucherPDF(data: CabVoucherData): jsPDF {
  const doc = new jsPDF();

  // Header Background
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(0, 0, 210, 36, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('CAB / TRANSPORT VOUCHER', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ghumo Firoo Travels | Transport Desk: +91 99109 87264 / +91 98702 29792', 14, 27);

  doc.text(`Voucher #: ${data.voucherNumber}`, 145, 18);
  doc.text(`Date: ${data.bookingDate}`, 145, 25);

  // Details Box
  doc.setFillColor(BRAND_LIGHT[0], BRAND_LIGHT[1], BRAND_LIGHT[2]);
  doc.rect(14, 44, 182, 45, 'F');
  doc.rect(14, 44, 182, 45, 'S');

  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Passenger & Route Details:', 18, 53);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Guest Name: ${data.guestName}`, 18, 61);
  doc.text(`Guest Contact: ${data.guestPhone}`, 18, 67);
  doc.text(`Pickup Location: ${data.pickupLocation}`, 18, 73);
  doc.text(`Drop Location: ${data.dropLocation}`, 18, 79);

  doc.setFont('helvetica', 'bold');
  doc.text(`Vehicle Type: ${data.vehicleType}`, 115, 61);
  doc.setFont('helvetica', 'normal');
  doc.text(`Pickup Date: ${data.pickupDate}`, 115, 67);
  doc.text(`Pickup Time: ${data.pickupTime}`, 115, 73);
  doc.text(`Driver Name: ${data.driverName || 'Assigned on arrival'} (${data.driverPhone || 'N/A'})`, 115, 79);

  // Inclusions List
  let y = 98;
  doc.setFont('helvetica', 'bold');
  doc.text('Inclusions:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  (data.inclusions || ['Toll Tax', 'State Permitted Tolls', 'Driver Allowance', 'Fuel Costs']).forEach(inc => {
    y += 5;
    doc.text(`• ${inc}`, 18, y);
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Ghumo Firoo Journeys — Cab Partner Voucher', 14, 280);

  return doc;
}

/**
 * Generate Activity & Sightseeing Confirmation Voucher PDF
 */
export function generateActivityVoucherPDF(data: ActivityVoucherData): jsPDF {
  const doc = new jsPDF();

  // Header Background
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(0, 0, 210, 36, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ACTIVITY & SIGHTSEEING VOUCHER', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Ghumo Firoo Journeys | Concierge Desk: +91-9876543210', 14, 27);

  doc.text(`Voucher #: ${data.voucherNumber}`, 145, 18);
  doc.text(`Date: ${data.bookingDate}`, 145, 25);

  // Details Box
  doc.setFillColor(BRAND_LIGHT[0], BRAND_LIGHT[1], BRAND_LIGHT[2]);
  doc.rect(14, 44, 182, 50, 'F');
  doc.rect(14, 44, 182, 50, 'S');

  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Excursion & Booking Details:', 18, 53);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Guest Name: ${data.guestName}`, 18, 61);
  doc.text(`Guest Phone: ${data.guestPhone}`, 18, 67);
  doc.text(`Activity / Tour: ${data.activityName}`, 18, 73);
  doc.text(`Location / City: ${data.location || data.city}`, 18, 79);
  doc.text(`Ticket / Ref #: ${(data as any).confirmationNumber || 'Confirmed by Agency'}`, 18, 85);

  doc.setFont('helvetica', 'bold');
  doc.text(`Activity Date: ${data.activityDate}`, 115, 61);
  doc.setFont('helvetica', 'normal');
  doc.text(`Time Slot: ${data.timeSlot || 'As per itinerary schedule'}`, 115, 67);
  doc.text(`Adults: ${data.adultsCount} | Children: ${data.childrenCount}`, 115, 73);
  doc.text(`Operator/Guide: ${data.supplierContact || 'On-site Concierge'}`, 115, 79);

  // Instructions
  let y = 104;
  doc.setFont('helvetica', 'bold');
  doc.text('Important Instructions:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  [
    'Please present a digital or printed copy of this voucher at the activity counter / boarding point.',
    'Arrive at least 15-30 minutes prior to your scheduled time slot.',
    'Carry a valid government photo ID for each passenger.'
  ].forEach(inst => {
    y += 5;
    doc.text(`• ${inst}`, 18, y);
  });

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Ghumo Firoo Journeys — Official Activity Voucher', 14, 280);

  return doc;
}

