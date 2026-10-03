/**
 * Voucher & Invoice Service — Ghumo Firoo Journeys
 * Generates GST Invoices, Hotel Vouchers, Cab/Transport Vouchers, and Activity Passes
 */

import jsPDF from 'jspdf';
import { OFFICIAL_BANK_DETAILS } from '@/constants/bankDetails';

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

export interface MasterVoucherData {
  voucherNumber: string;
  issueDate: string;
  leadId?: string | number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  destination: string;
  travelDates: string;
  adults: number;
  children: number;
  infants?: number;
  packageTitle?: string;
  emergencyContact?: string;
  hotels: Array<{
    dayNumber?: number;
    destination: string;
    hotelName: string;
    roomCategory?: string;
    mealPlan?: string;
    checkIn: string;
    checkOut: string;
    nights?: number;
    rooms?: number;
    confirmationNumber?: string;
    hotelContact?: string;
    address?: string;
  }>;
  transport: Array<{
    dayNumber?: number;
    vehicleType: string;
    pickupDate?: string;
    pickupTime?: string;
    pickupLocation?: string;
    dropLocation?: string;
    driverName?: string;
    driverPhone?: string;
    vehicleNumber?: string;
    inclusions?: string[];
  }>;
  activities?: Array<{
    dayNumber?: number;
    activityName: string;
    date?: string;
    location?: string;
    inclusions?: string;
  }>;
  financials?: {
    totalAmount: number;
    advancePaid: number;
    balanceDue: number;
    paymentMode?: string;
  };
  specialInstructions?: string[];
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
  doc.text(`Account Name: ${OFFICIAL_BANK_DETAILS.accountName}`, 18, startY + 13);
  doc.text(`Bank Name: ${OFFICIAL_BANK_DETAILS.bankName} | Branch: ${OFFICIAL_BANK_DETAILS.branch}`, 18, startY + 19);
  doc.text(`Account No: ${OFFICIAL_BANK_DETAILS.accountNumber} | IFSC Code: ${OFFICIAL_BANK_DETAILS.ifscCode}`, 18, startY + 25);

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

/**
 * Generate Consolidated Master Tour Voucher PDF (Hotels + Cabs + Activities + Financials)
 */
export function generateMasterVoucherPDF(data: MasterVoucherData): jsPDF {
  const doc = new jsPDF();
  const pageWidth = 210;

  const drawHeader = (pageNum: number, totalPages: number) => {
    // Header Banner Background
    doc.setFillColor(11, 16, 38); // #0B1026
    doc.rect(0, 0, pageWidth, 38, 'F');

    // Gold Accent Stripe
    doc.setFillColor(201, 162, 90); // #C9A25A
    doc.rect(0, 38, pageWidth, 2.5, 'F');

    // Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('GHUMO FIROO JOURNEYS', 14, 16);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(201, 162, 90);
    doc.text('PREMIUM TRAVEL EXPERIENCES & TOUR OPERATOR', 14, 22);

    doc.setTextColor(148, 163, 184);
    doc.text('24x7 Operations: +91 80109 89792 | support@ghumofiroo.com | ghumofiroo.com', 14, 28);

    // Document Title & Voucher Badge
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('CONSOLIDATED TOUR VOUCHER', pageWidth - 14, 16, { align: 'right' });

    doc.setFontSize(9);
    doc.setTextColor(201, 162, 90);
    doc.text(`Ref: ${data.voucherNumber}`, pageWidth - 14, 23, { align: 'right' });

    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225);
    doc.text(`Issued: ${data.issueDate} | Page ${pageNum} of ${totalPages}`, pageWidth - 14, 30, { align: 'right' });
  };

  drawHeader(1, 2);

  let y = 47;

  // 1. GUEST & TOUR SUMMARY GRID
  doc.setFillColor(BRAND_LIGHT[0], BRAND_LIGHT[1], BRAND_LIGHT[2]);
  doc.rect(14, y, 182, 26, 'F');
  doc.rect(14, y, 182, 26, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.text('PRIMARY GUEST:', 18, y + 6);
  doc.text('TOUR DESTINATION:', 105, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.text(`${data.customerName || 'Valued Guest'} ${data.customerPhone ? `(${data.customerPhone})` : ''}`, 18, y + 12);
  doc.text(data.destination || 'Custom Tour Circuit', 105, y + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('PASSENGER MANIFEST:', 18, y + 19);
  doc.text('TRAVEL DURATION:', 105, y + 19);

  doc.setFont('helvetica', 'normal');
  const paxDetails = `${data.adults || 2} Adults${(data.children || 0) > 0 ? `, ${data.children} Children` : ''}${(data.infants || 0) > 0 ? `, ${data.infants} Infants` : ''}`;
  doc.text(paxDetails, 18, y + 24);
  doc.text(data.travelDates || 'Confirmed Itinerary Schedule', 105, y + 24);

  y += 33;

  // 2. ACCOMMODATIONS SCHEDULE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('1. CONFIRMED ACCOMMODATIONS (HOTEL PASS)', 14, y);
  y += 4;

  // Hotel Table Header
  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Day / City', 17, y + 5);
  doc.text('Hotel Name & Address', 52, y + 5);
  doc.text('Room & Meal Plan', 115, y + 5);
  doc.text('Stay Dates', 152, y + 5);
  doc.text('Conf #', 180, y + 5);
  y += 7;

  const hotelsToRender = data.hotels.length > 0 ? data.hotels : [
    { destination: data.destination || 'Tour City', hotelName: 'Confirmed Partner Hotel', roomCategory: 'Deluxe Room', mealPlan: 'MAP', checkIn: data.travelDates.split(' - ')[0] || 'Day 1', checkOut: 'Check-out', confirmationNumber: 'CONF-PENDING' }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.setFontSize(7.5);

  hotelsToRender.forEach((h, idx) => {
    const rowH = 12;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, rowH, 'F');
    }
    doc.rect(14, y, 182, rowH, 'S');

    doc.setFont('helvetica', 'bold');
    doc.text(h.destination || `Day ${idx + 1}`, 17, y + 5);
    doc.setFont('helvetica', 'normal');

    // Truncate strings cleanly
    const hName = h.hotelName.length > 32 ? h.hotelName.substring(0, 30) + '...' : h.hotelName;
    doc.text(hName, 52, y + 5);
    if (h.address) {
      doc.setFontSize(6.5);
      doc.setTextColor(100, 116, 139);
      doc.text(h.address.substring(0, 40), 52, y + 9);
      doc.setFontSize(7.5);
      doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
    }

    doc.text(`${h.roomCategory || 'Deluxe'} (${h.mealPlan || 'CP'})`, 115, y + 5);
    doc.text(`${h.checkIn || ''}`, 152, y + 5);
    if (h.checkOut) {
      doc.text(`to ${h.checkOut}`, 152, y + 9);
    }
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text(h.confirmationNumber || 'CONFIRMED', 180, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);

    y += rowH;
  });

  y += 6;

  // 3. TRANSPORT & CHAUFFEUR ALLOCATION
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('2. DEDICATED TRANSPORT & CHAUFFEUR PASS', 14, y);
  y += 4;

  doc.setFillColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.rect(14, y, 182, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(255, 255, 255);
  doc.text('Vehicle Assigned', 17, y + 5);
  doc.text('Chauffeur / Driver Details', 65, y + 5);
  doc.text('Vehicle Reg Number', 120, y + 5);
  doc.text('Pickup Schedule & Route', 155, y + 5);
  y += 7;

  const transportToRender = data.transport.length > 0 ? data.transport : [
    { vehicleType: 'AC Sedan / Innova Dedicated', driverName: 'Assigned Driver', driverPhone: '+91 80109 89792', vehicleNumber: 'Assigned on arrival', pickupLocation: 'Airport / Station Pickup' }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.setFontSize(7.5);

  transportToRender.forEach((t, idx) => {
    const rowH = 11;
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, rowH, 'F');
    }
    doc.rect(14, y, 182, rowH, 'S');

    doc.setFont('helvetica', 'bold');
    doc.text(t.vehicleType || 'Dedicated AC Cab', 17, y + 5);
    doc.setFont('helvetica', 'normal');

    doc.text(`${t.driverName || 'Chauffeur Assigned'} (${t.driverPhone || '+91 8010989792'})`, 65, y + 5);
    doc.text(t.vehicleNumber || 'State Registered Taxi', 120, y + 5);
    doc.text((t.pickupLocation || 'Station / Hotel Pickup').substring(0, 24), 155, y + 5);

    y += rowH;
  });

  y += 6;

  // 4. FINANCIAL SUMMARY & INVOICE BALANCE TABLE
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('3. PAYMENT LEDGER & VOUCHER BILLING SUMMARY', 14, y);
  y += 4;

  const fin = data.financials || { totalAmount: 50000, advancePaid: 25000, balanceDue: 25000 };

  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 18, 'F');
  doc.rect(14, y, 182, 18, 'S');

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(BRAND_DARK[0], BRAND_DARK[1], BRAND_DARK[2]);
  doc.text('TOTAL TOUR COST:', 18, y + 6);
  doc.text('ADVANCE RECEIVED:', 75, y + 6);
  doc.text('BALANCE DUE ON ARRIVAL:', 135, y + 6);

  doc.setFontSize(9.5);
  doc.text(`Rs. ${Math.round(fin.totalAmount).toLocaleString('en-IN')}`, 18, y + 13);

  doc.setTextColor(34, 197, 94); // Green
  doc.text(`Rs. ${Math.round(fin.advancePaid).toLocaleString('en-IN')} (Verified)`, 75, y + 13);

  if (fin.balanceDue > 0) {
    doc.setTextColor(225, 29, 72); // Red
    doc.text(`Rs. ${Math.round(fin.balanceDue).toLocaleString('en-IN')}`, 135, y + 13);
  } else {
    doc.setTextColor(34, 197, 94);
    doc.text('NIL (Fully Paid)', 135, y + 13);
  }

  y += 24;

  // 5. IMPORTANT OPERATIONAL GUIDELINES
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(BRAND_NAVY[0], BRAND_NAVY[1], BRAND_NAVY[2]);
  doc.text('4. IMPORTANT OPERATIONAL INSTRUCTIONS FOR TRAVELERS', 14, y);
  y += 4;

  doc.setFillColor(254, 243, 199); // Amber tint
  doc.rect(14, y, 182, 28, 'F');
  doc.rect(14, y, 182, 28, 'S');

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(120, 53, 15);

  const guidelines = [
    'Government Photo ID (Aadhaar / Passport / Voter ID) is mandatory for every guest at hotel check-in.',
    'Standard Hotel Check-in time is 12:00 PM / 02:00 PM & Check-out time is 10:00 AM / 11:00 AM.',
    'Air Conditioning will not be operational in hill/mountain routes as per standard regional taxi guidelines.',
    'Balance payment (if applicable) is strictly payable on Day 1 upon arrival to your tour manager or driver.',
    'For any roadside assistance, hotel coordination, or route queries, contact our 24x7 desk: +91 80109 89792.'
  ];

  guidelines.forEach((g) => {
    y += 5;
    doc.text(`•  ${g}`, 18, y);
  });

  // Footer Sign-off
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Generated electronically by Ghumo Firoo Journeys CRM. No physical signature required.', 14, 284);
  doc.text('Authorized Operations Desk — Ghumo Firoo Journeys', 125, 284);

  return doc;
}

/**
 * Standard Destination Code resolver across Ghumo Firoo Journeys
 */
export function getDestinationCode(dest?: string, title?: string): string {
  const text = `${dest || ''} ${title || ''}`.toLowerCase();
  if (text.includes('rann') || text.includes('kutch') || text.includes('dhordo') || text.includes('bhuj')) return 'KT';
  if (text.includes('dholavira') || text.includes('road to heaven')) return 'DH';
  if (text.includes('somnath') || text.includes('dwarka') || text.includes('gir') || text.includes('gujarat') || text.includes('statue of unity') || text.includes('ahmedabad')) return 'GJ';
  if (text.includes('kashmir') || text.includes('srinagar') || text.includes('gulmarg') || text.includes('pahalgam')) return 'KS';
  if (text.includes('kerala') || text.includes('munnar') || text.includes('alleppey') || text.includes('kochi')) return 'KL';
  if (text.includes('himachal') || text.includes('manali') || text.includes('shimla') || text.includes('dharamshala')) return 'HP';
  if (text.includes('uttarakhand') || text.includes('chardham') || text.includes('haridwar') || text.includes('rishikesh')) return 'UK';
  if (text.includes('rajasthan') || text.includes('jaipur') || text.includes('udaipur') || text.includes('jaisalmer') || text.includes('jodhpur')) return 'RJ';
  if (text.includes('goa')) return 'GOA';
  if (text.includes('dubai') || text.includes('uae')) return 'DXB';
  if (text.includes('singapore')) return 'SG';
  if (text.includes('thailand') || text.includes('bangkok') || text.includes('phuket')) return 'TH';
  if (text.includes('bali') || text.includes('indonesia')) return 'BALI';
  if (text.includes('vietnam')) return 'VN';
  if (text.includes('georgia')) return 'GE';
  return 'GEN';
}

/**
 * Format standard Quote Reference: GFQ-[DEST]-[LEAD_ID][-V#]
 */
export function formatQuoteRef(dest?: string, leadId?: string | number, version = 1): string {
  const code = getDestinationCode(dest);
  const idStr = leadId ? String(leadId).padStart(4, '0') : String(Math.floor(1000 + Math.random() * 9000));
  return `GFQ-${code}-${idStr}${version > 1 ? `-V${version}` : ''}`;
}

/**
 * Format standard Voucher / Document References
 */
export function formatVoucherRef(
  type: 'HOTEL' | 'CAB' | 'ACTIVITY' | 'INVOICE' | 'RECEIPT',
  dest?: string,
  leadId?: string | number,
  suffix?: string | number
): string {
  const code = getDestinationCode(dest);
  const idStr = leadId ? String(leadId).padStart(4, '0') : '0001';
  const prefixMap: Record<string, string> = {
    HOTEL: 'VCH',
    CAB: 'CAB',
    ACTIVITY: 'ACT',
    INVOICE: 'INV',
    RECEIPT: 'REC'
  };
  const prefix = prefixMap[type] || 'VCH';
  return suffix !== undefined ? `${prefix}-${code}-${idStr}-${suffix}` : `${prefix}-${code}-${idStr}`;
}

