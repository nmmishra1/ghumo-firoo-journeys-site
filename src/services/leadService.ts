import { toast } from '@/hooks/use-toast';
import { submitToGoogleSheets } from '@/lib/googleSheets';
import { supabase } from '@/integrations/supabase/client';

export interface BookingPayment {
  paymentId: string;
  leadId: string;
  paymentDate: string;
  amountReceived: number;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Credit Card' | 'Debit Card';
  referenceNumber?: string;
  remarks?: string;
  receivedBy: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  date: string;
  time: string;
  timestamp: string;
}

export interface AttachedPackage {
  packageId: string;
  packageName: string;
  destination: string;
  packageCost: number;
  travelDate: string;
  numberOfPax: number;
  remarks: string;
  createdAt: string;
  countryId?: string;
  stateId?: string;
  selectedCities?: string[];
  theme?: string;
  interests?: string;
}

export interface JourneyEvent {
  eventId: string;
  leadId: string;
  stage: string;
  status: string;
  remarks: string;
  agent: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface Lead {
  id?: string;
  packageName: string;
  packagePrice: number;
  duration: string;
  destinations: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  source: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  notes?: string;
  followUpDate?: string;
  discussions?: { timestamp: string; text: string; type?: string; createdBy?: string; }[];
  leadId?: string;
  leadCreatedDate?: string;
  leadPurchasedDate?: string;
  customerCategory?: string;
  leadDestination?: string[];
  packageCost?: number;
  tripStartDate?: string;
  tripEndDate?: string;
  numberOfNights?: number;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  totalPaxCount?: number;
  lastContactDate?: string;
  daysSinceLastContact?: number;
  lostReason?: string;
  agentName?: string;
  emailStatus?: 'Pending' | 'Sent' | 'Failed' | 'Not Sent';
  emailSentDate?: string;
  lastEmailSentDate?: string;
  emailSentCount?: number;
  emailHistory?: {
    date: string;
    time: string;
    recipient: string;
    subject: string;
    status: string;
    sentBy: string;
  }[];
  brochureRequested?: 'Yes' | 'No' | boolean;
  brochureSent?: 'Yes' | 'No' | boolean;
  brochureSentDate?: string;
  brochureEmailStatus?: 'Pending' | 'Sent' | 'Failed' | 'Not Sent';
  city?: string;
  travelMonth?: string;
  numberOfTravelers?: number;
  budget?: string;
  hotelCategory?: string;
  pdfBase64?: string;
  pdfFileName?: string;
  nextPaymentDueDate?: string;
  payments?: BookingPayment[];
  auditLogs?: AuditLog[];
  attachedPackages?: AttachedPackage[];
  leadJourney?: JourneyEvent[];
  whatsappNumber?: string | null;
  companyName?: string | null;
  country?: string | null;
  state?: string | null;
  packageType?: string | null;
  interests?: string | null;
  transportPreference?: string | null;
  expectedBookingValue?: number | null;
  communicationMethod?: string | null;
  nextAction?: string | null;
}

export interface Expense {
  id: string;
  amount: number;
  paymentDate: string;
  category: string;
  subCategory: string;
  leadSource?: string;
  remarks?: string;
  vendorName?: string;
  referenceNumber?: string;
  createdBy: string;
  createdDate: string;
  modifiedBy?: string;
  modifiedDate?: string;
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

// Mapper functions to convert between frontend camelCase Lead and DB snake_case tables
function mapLeadToDb(lead: Partial<Lead>): any {
  const db: any = {};
  if (lead.id !== undefined) db.id = lead.id;
  if (lead.packageName !== undefined) db.package_name = lead.packageName;
  if (lead.packagePrice !== undefined) db.package_price = lead.packagePrice;
  if (lead.duration !== undefined) db.duration = lead.duration;
  if (lead.destinations !== undefined) db.destinations = lead.destinations;
  if (lead.customerName !== undefined) db.customer_name = lead.customerName;
  if (lead.customerEmail !== undefined) db.customer_email = lead.customerEmail;
  if (lead.customerPhone !== undefined) db.customer_phone = lead.customerPhone;
  if (lead.source !== undefined) db.source = lead.source;
  if (lead.status !== undefined) db.status = lead.status;
  if (lead.createdAt !== undefined) db.created_at = lead.createdAt;
  if (lead.updatedAt !== undefined) db.updated_at = lead.updatedAt;
  if (lead.notes !== undefined) db.notes = lead.notes;
  if (lead.followUpDate !== undefined) db.follow_up_date = lead.followUpDate ? new Date(lead.followUpDate).toISOString() : null;
  if (lead.leadId !== undefined) db.external_lead_ref = lead.leadId;
  if (lead.leadCreatedDate !== undefined) db.lead_created_date = lead.leadCreatedDate ? new Date(lead.leadCreatedDate).toISOString() : null;
  if (lead.leadPurchasedDate !== undefined) db.lead_purchased_date = lead.leadPurchasedDate ? new Date(lead.leadPurchasedDate).toISOString() : null;
  if (lead.customerCategory !== undefined) db.customer_category = lead.customerCategory;
  if (lead.packageCost !== undefined) db.package_cost = lead.packageCost;
  if (lead.tripStartDate !== undefined) db.trip_start_date = lead.tripStartDate;
  if (lead.tripEndDate !== undefined) db.trip_end_date = lead.tripEndDate;
  if (lead.numberOfNights !== undefined) db.number_of_nights = lead.numberOfNights;
  if (lead.adultCount !== undefined) db.adult_count = lead.adultCount;
  if (lead.childCount !== undefined) db.child_count = lead.childCount;
  if (lead.infantCount !== undefined) db.infant_count = lead.infantCount;
  if (lead.lastContactDate !== undefined) db.last_contact_date = lead.lastContactDate ? new Date(lead.lastContactDate).toISOString() : null;
  if (lead.lostReason !== undefined) db.lost_reason = lead.lostReason;
  if (lead.agentName !== undefined) db.agent_name = lead.agentName;
  if ((lead as any).assignedTo !== undefined) db.assigned_to = (lead as any).assignedTo;
  if ((lead as any).assigned_to !== undefined) db.assigned_to = (lead as any).assigned_to;
  if (lead.emailStatus !== undefined) db.email_status = lead.emailStatus;
  if (lead.emailSentDate !== undefined) db.email_sent_date = lead.emailSentDate ? new Date(lead.emailSentDate).toISOString() : null;
  if (lead.lastEmailSentDate !== undefined) db.last_email_sent_date = lead.lastEmailSentDate ? new Date(lead.lastEmailSentDate).toISOString() : null;
  if (lead.emailSentCount !== undefined) db.email_sent_count = lead.emailSentCount;
  if (lead.emailHistory !== undefined) db.email_history = lead.emailHistory;
  
  if (lead.brochureRequested !== undefined) {
    db.brochure_requested = (lead.brochureRequested === 'Yes' || lead.brochureRequested === true);
  }
  if (lead.brochureSent !== undefined) {
    db.brochure_sent = (lead.brochureSent === 'Yes' || lead.brochureSent === true);
  }
  if (lead.brochureSentDate !== undefined) db.brochure_sent_date = lead.brochureSentDate ? new Date(lead.brochureSentDate).toISOString() : null;
  if (lead.brochureEmailStatus !== undefined) db.brochure_email_status = lead.brochureEmailStatus;
  if (lead.city !== undefined) db.customer_home_city = lead.city;
  if (lead.travelMonth !== undefined) db.travel_month = lead.travelMonth;
  if (lead.pdfFileName !== undefined) db.pdf_file_name = lead.pdfFileName;
  if (lead.nextPaymentDueDate !== undefined) db.next_payment_due_date = lead.nextPaymentDueDate ? new Date(lead.nextPaymentDueDate).toISOString() : null;
  if (lead.attachedPackages !== undefined) db.attached_packages = lead.attachedPackages;
  if (lead.budget !== undefined) db.budget = lead.budget;
  if (lead.hotelCategory !== undefined) db.hotel_category = lead.hotelCategory;
  if (lead.whatsappNumber !== undefined) db.whatsapp_number = lead.whatsappNumber;
  if (lead.companyName !== undefined) db.company_name = lead.companyName;
  if (lead.country !== undefined) db.country = lead.country;
  if (lead.state !== undefined) db.state = lead.state;
  if (lead.packageType !== undefined) db.package_type = lead.packageType;
  if (lead.interests !== undefined) db.interests = lead.interests;
  if (lead.transportPreference !== undefined) db.transport_preference = lead.transportPreference;
  if (lead.expectedBookingValue !== undefined) db.expected_booking_value = lead.expectedBookingValue;
  if (lead.communicationMethod !== undefined) db.communication_method = lead.communicationMethod;
  if (lead.nextAction !== undefined) db.next_action = lead.nextAction;
  
  return db;
}

function mapLeadFromDb(db: any): Lead {
  // Spread the raw DB row first so that CRM.tsx and LeadForm.tsx can read
  // snake_case fields directly (e.g. customer_name, trip_start_date, assigned_to).
  // The explicit camelCase aliases below are kept for any code that uses them.
  return {
    ...db, // Preserve ALL raw snake_case DB columns (customer_name, customer_email, etc.)
    id: db.id != null ? String(db.id) : undefined,
    packageName: db.package_name,
    packagePrice: Number(db.package_price) || 0,
    duration: db.duration || '',
    destinations: db.destinations || '',
    customerName: db.customer_name,
    customerEmail: db.customer_email || '',
    customerPhone: db.customer_phone,
    source: db.source || '',
    status: db.status,
    createdAt: db.created_at,
    updatedAt: db.updated_at,
    notes: db.notes || '',
    followUpDate: db.follow_up_date ? db.follow_up_date.split('T')[0] : undefined,
    follow_up_date: db.follow_up_date ? db.follow_up_date.split('T')[0] : undefined,
    discussions: db.lead_journey ? db.lead_journey.map(mapJourneyFromDb) : [], // Timeline array mapped from communications in PHP
    leadId: db.external_lead_ref || '',
    leadCreatedDate: db.lead_created_date ? db.lead_created_date.split('T')[0] : undefined,
    leadPurchasedDate: db.lead_purchased_date ? db.lead_purchased_date.split('T')[0] : undefined,
    customerCategory: db.customer_category || '',
    leadDestination: db.destinations ? [db.destinations] : [],
    packageCost: Number(db.package_cost) || 0,
    tripStartDate: db.trip_start_date || '',
    tripEndDate: db.trip_end_date || '',
    numberOfNights: db.number_of_nights,
    adultCount: db.adult_count || 1,
    childCount: db.child_count || 0,
    infantCount: db.infant_count || 0,
    totalPaxCount: (db.adult_count || 1) + (db.child_count || 0) + (db.infant_count || 0),
    lastContactDate: db.last_contact_date ? db.last_contact_date.split('T')[0] : undefined,
    daysSinceLastContact: 0, // Computed dynamically during post-fetch loop
    lostReason: db.lost_reason || '',
    agentName: db.agent_name || '',
    assigned_to: db.assigned_to != null ? String(db.assigned_to) : null,
    assignedTo: db.assigned_to != null ? String(db.assigned_to) : null,
    emailStatus: db.email_status || 'Not Sent',
    emailSentDate: db.email_sent_date || undefined,
    lastEmailSentDate: db.last_email_sent_date || undefined,
    emailSentCount: db.email_sent_count || 0,
    emailHistory: db.email_history || [],
    brochureRequested: db.brochure_requested ? 'Yes' : 'No',
    brochureSent: db.brochure_sent ? 'Yes' : 'No',
    brochureSentDate: db.brochure_sent_date ? db.brochure_sent_date.split('T')[0] : '',
    brochureEmailStatus: db.brochure_email_status || 'Not Sent',
    city: db.customer_home_city || '',
    travelMonth: db.travel_month || '',
    numberOfTravelers: (db.adult_count || 1) + (db.child_count || 0) + (db.infant_count || 0),
    budget: db.budget || '',
    hotelCategory: db.hotel_category || '',
    pdfFileName: db.pdf_file_name || '',
    nextPaymentDueDate: db.next_payment_due_date ? db.next_payment_due_date.split('T')[0] : undefined,
    attachedPackages: db.attached_packages || [],
    payments: db.payments ? db.payments.map(mapPaymentFromDb) : [],
    leadJourney: db.lead_journey ? db.lead_journey.map(mapJourneyFromDb) : [],
    whatsappNumber: db.whatsapp_number || '',
    companyName: db.company_name || '',
    country: db.country || '',
    state: db.state || '',
    packageType: db.package_type || '',
    interests: db.interests || '',
    transportPreference: db.transport_preference || '',
    expectedBookingValue: db.expected_booking_value != null ? Number(db.expected_booking_value) : null,
    communicationMethod: db.communication_method || '',
    nextAction: db.next_action || ''
  };
}

function mapPaymentToDb(pay: any): any {
  return {
    id: pay.paymentId,
    lead_id: pay.leadId,
    amount_received: pay.amountReceived,
    payment_date: pay.paymentDate,
    payment_mode: pay.paymentMode,
    reference_number: pay.referenceNumber || null,
    remarks: pay.remarks || null,
    received_by: pay.receivedBy,
    created_at: pay.createdAt
  };
}

function mapPaymentFromDb(db: any): BookingPayment {
  return {
    paymentId: db.id,
    leadId: db.lead_id,
    amountReceived: Number(db.amount_received) || 0,
    paymentDate: db.payment_date,
    paymentMode: db.payment_mode,
    referenceNumber: db.reference_number || undefined,
    remarks: db.remarks || undefined,
    receivedBy: db.received_by || '',
    createdAt: db.created_at
  };
}

function mapJourneyToDb(evt: any): any {
  return {
    id: evt.eventId,
    lead_id: evt.leadId,
    status: evt.status,
    remarks: evt.remarks || null,
    agent: evt.agent || null,
    timestamp: evt.timestamp
  };
}

function mapJourneyFromDb(db: any): JourneyEvent {
  return {
    eventId: db.id,
    leadId: db.lead_id,
    stage: db.status,
    status: db.status,
    remarks: db.remarks || '',
    agent: db.agent || '',
    timestamp: db.timestamp
  };
}

function mapExpenseToDb(exp: Partial<Expense>): any {
  const db: any = {};
  if (exp.id !== undefined) db.id = exp.id;
  if (exp.amount !== undefined) db.amount = exp.amount;
  if (exp.paymentDate !== undefined) db.payment_date = exp.paymentDate;
  if (exp.category !== undefined) db.category = exp.category;
  if (exp.subCategory !== undefined) db.sub_category = exp.subCategory;
  if (exp.leadSource !== undefined) db.lead_source = exp.leadSource || exp.subCategory;
  if (exp.remarks !== undefined) db.remarks = exp.remarks;
  if (exp.vendorName !== undefined) db.vendor_name = exp.vendorName;
  if (exp.referenceNumber !== undefined) db.reference_number = exp.referenceNumber;
  if (exp.createdBy !== undefined) db.created_by = exp.createdBy;
  if (exp.createdDate !== undefined) db.created_date = exp.createdDate;
  if (exp.modifiedBy !== undefined) db.modified_by = exp.modifiedBy;
  if (exp.modifiedDate !== undefined) db.modified_date = exp.modifiedDate;
  return db;
}

function mapExpenseFromDb(db: any): Expense {
  return {
    id: db.id,
    amount: Number(db.amount) || 0,
    paymentDate: db.payment_date,
    category: db.category,
    subCategory: db.sub_category,
    leadSource: db.lead_source || db.sub_category,
    remarks: db.remarks || '',
    vendorName: db.vendor_name || '',
    referenceNumber: db.reference_number || '',
    createdBy: db.created_by,
    createdDate: db.created_date,
    modifiedBy: db.modified_by || undefined,
    modifiedDate: db.modified_date || undefined
  };
}

const API_BASE = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE) {
  throw new Error('VITE_API_BASE_URL is not configured! Verify your env files.');
}

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

class LeadService {
  private apiUrl = '/api/leads';

  // Create a new lead
  async createLead(leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>): Promise<Lead> {
    const snakeToCamel: { [key: string]: string } = {
      customer_name: 'customerName',
      customer_email: 'customerEmail',
      email: 'customerEmail',
      customer_phone: 'customerPhone',
      contact_number: 'customerPhone',
      customer_home_city: 'customerHomeCity',
      destinations: 'destinations',
      source: 'source',
      customer_type: 'source',
      status: 'status',
      notes: 'notes',
      discussion_notes: 'notes',
      remarks: 'notes',
      follow_up_date: 'followUpDate',
      travel_month: 'travelMonth',
      adult_count: 'adultCount',
      child_count: 'childCount',
      infant_count: 'infantCount',
      budget: 'budget',
      hotel_category: 'hotelCategory',
      package_name: 'packageName',
      package_price: 'packagePrice',
      package_cost: 'packageCost',
      trip_start_date: 'tripStartDate',
      trip_end_date: 'tripEndDate',
      number_of_nights: 'numberOfNights',
      lost_reason: 'lostReason',
      agent_name: 'agentName',
      last_contact_date: 'lastContactDate',
      assigned_to: 'assignedTo',
      is_deleted: 'isDeleted'
    };

    const normalized: any = { ...leadData };
    for (const [snakeKey, camelKey] of Object.entries(snakeToCamel)) {
      if ((leadData as any)[snakeKey] !== undefined) {
        normalized[camelKey] = (leadData as any)[snakeKey];
        if (snakeKey !== camelKey) {
          delete normalized[snakeKey];
        }
      }
    }
    leadData = normalized;

    try {
      const authHeaders = await getAuthHeader();
      const leadPurchasedDate = leadData.leadPurchasedDate || new Date().toISOString().split('T')[0];
      
      const emailHistory = [...(leadData.emailHistory || [])];
      let emailSentCount = leadData.emailSentCount || 0;
      let emailSentDate = leadData.emailSentDate;
      let lastEmailSentDate = leadData.lastEmailSentDate;

      const todayStr = new Date().toISOString().split('T')[0];
      const defaultEmailStatus = (leadPurchasedDate === todayStr) ? 'Pending' : 'Not Sent';
      const actualEmailStatus = leadData.emailStatus || defaultEmailStatus;

      if (actualEmailStatus === 'Sent' && emailHistory.length === 0) {
        const now = new Date();
        emailHistory.push({
          date: now.toISOString().split('T')[0],
          time: now.toTimeString().split(' ')[0],
          recipient: leadData.customerEmail || '',
          subject: "Welcome Quote & Itinerary - Ghumo Firoo Travels",
          status: 'Sent',
          sentBy: 'System'
        });
        emailSentCount = 1;
        emailSentDate = now.toISOString();
        lastEmailSentDate = now.toISOString();
      }

      const isBrochureSource = leadData.source === 'Brochure Download';

      const lead: Lead = {
        ...leadData,
        leadId: leadData.leadId || `LD${new Date(leadPurchasedDate).getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        leadPurchasedDate: leadPurchasedDate,
        leadCreatedDate: leadPurchasedDate,
        emailStatus: actualEmailStatus,
        emailSentDate: emailSentDate || undefined,
        lastEmailSentDate: lastEmailSentDate || undefined,
        emailSentCount: emailSentCount,
        emailHistory: emailHistory,
        brochureRequested: isBrochureSource ? 'Yes' : (leadData.brochureRequested || 'No'),
        brochureSent: isBrochureSource ? 'Yes' : (leadData.brochureSent || 'No'),
        brochureSentDate: isBrochureSource ? (leadData.brochureSentDate || leadPurchasedDate) : (leadData.brochureSentDate || ''),
        brochureEmailStatus: isBrochureSource ? 'Sent' : (leadData.brochureEmailStatus || (leadData.brochureRequested === 'Yes' ? 'Pending' : 'Not Sent')),
        city: leadData.city || '',
        travelMonth: leadData.travelMonth || '',
        numberOfTravelers: leadData.numberOfTravelers || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const dbObj = {
        customer_name: lead.customerName || (lead as any).name || '',
        customer_phone: lead.customerPhone || (lead as any).phone || '',
        customer_email: lead.customerEmail || (lead as any).email || '',
        customer_home_city: lead.city || '',
        city: lead.city || '',
        source: lead.source || 'manual',
        source_detail: (lead as any).sourceDetail || null,
        destinations: lead.destination || (lead as any).packageName || '',
        trip_start_date: lead.travelMonth || null,
        budget: lead.budget || null,
        duration: lead.duration || null,
        hotel_category: (lead as any).hotelCategory || null,
        status: lead.status || 'New',
        assigned_to: (lead as any).assignedTo || null,
        whatsapp_number: lead.customerPhone || (lead as any).phone || ''
      };

      let ok = false;
      try {
        const res = await fetch(`${API_BASE}/leads_create.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...authHeaders
          },
          body: JSON.stringify(dbObj)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.lead_id) {
            lead.id = data.lead_id.toString();
            (lead as any).isRepeatCustomer = Boolean(data.is_repeat_customer);
            (lead as any).previousTripsCount = data.previous_trips_count || 0;
            ok = true;
          }
        }
      } catch (err) {
        console.warn('PHP backend leads_create fetch error:', err);
      }

      // Fallback to Supabase public lead insert if PHP endpoint requires auth or fails
      if (!ok) {
        try {
          const sbPayload = { ...dbObj };
          delete (sbPayload as any).customer_home_city; // Clean field for Supabase schema
          const { data: sbData, error: sbError } = await supabase.from('leads' as any).insert([sbPayload] as any).select();
          if (!sbError && sbData && sbData[0]) {
            lead.id = String(sbData[0].id);
            ok = true;
          }
        } catch (e) {
          console.warn('Supabase lead insert fallback:', e);
        }
      }

      // Submit to Google Sheets (Backup) in background
      submitToGoogleSheets(lead).catch(() => {});

      return lead;
    } catch (error) {
      console.warn('Lead capture completed with fallback:', error);
      return leadData as any;
    }
  }

  // Get all leads
  async getLeads(): Promise<Lead[]> {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/leads_list.php`, {
        headers: { ...authHeaders }
      });
      if (res.ok) {
        const data = await res.json();
        const dbLeads = data.leads || [];

        if (Array.isArray(dbLeads)) {
          const mapped = dbLeads.map(mapLeadFromDb);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          const result = mapped.map(lead => {
            if (lead.lastContactDate) {
              const lastDate = new Date(lead.lastContactDate);
              lastDate.setHours(0, 0, 0, 0);
              const diffTime = today.getTime() - lastDate.getTime();
              const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
              lead.daysSinceLastContact = diffDays >= 0 ? diffDays : 0;
            } else {
              lead.daysSinceLastContact = 0;
            }
            return lead;
          });

          localStorage.setItem('crm_leads_cache', JSON.stringify(result));
          return result;
        }
      }
    } catch (error) {
      console.warn('Backend leads endpoint unavailable or offline:', error);
    }

    // Fallback to cached leads or local fallback state
    try {
      const cached = localStorage.getItem('crm_leads_cache');
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {}

    return [];
  }

  async updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead> {
    const snakeToCamel: { [key: string]: string } = {
      customer_name: 'customerName',
      customer_email: 'customerEmail',
      email: 'customerEmail',
      customer_phone: 'customerPhone',
      contact_number: 'customerPhone',
      customer_home_city: 'customerHomeCity',
      destinations: 'destinations',
      source: 'source',
      customer_type: 'source',
      status: 'status',
      notes: 'notes',
      discussion_notes: 'notes',
      remarks: 'notes',
      follow_up_date: 'followUpDate',
      travel_month: 'travelMonth',
      adult_count: 'adultCount',
      child_count: 'childCount',
      infant_count: 'infantCount',
      budget: 'budget',
      hotel_category: 'hotelCategory',
      package_name: 'packageName',
      package_price: 'packagePrice',
      package_cost: 'packageCost',
      trip_start_date: 'tripStartDate',
      trip_end_date: 'tripEndDate',
      number_of_nights: 'numberOfNights',
      lost_reason: 'lostReason',
      agent_name: 'agentName',
      last_contact_date: 'lastContactDate',
      assigned_to: 'assignedTo',
      is_deleted: 'isDeleted',
      whatsapp_number: 'whatsappNumber',
      company_name: 'companyName',
      country: 'country',
      state: 'state',
      package_type: 'packageType',
      interests: 'interests',
      transport_preference: 'transportPreference',
      expected_booking_value: 'expectedBookingValue',
      communication_method: 'communicationMethod',
      next_action: 'nextAction'
    };

    const normalized: any = { ...updates };
    for (const [snakeKey, camelKey] of Object.entries(snakeToCamel)) {
      if ((updates as any)[snakeKey] !== undefined) {
        normalized[camelKey] = (updates as any)[snakeKey];
      }
    }
    updates = normalized;

    try {
      const authHeaders = await getAuthHeader();

      const payload: any = {
        id: Number(leadId) || leadId,
        ...updates
      };
      if (updates.packagePrice !== undefined) payload.estimated_booking_value = updates.packagePrice;
      if (updates.status !== undefined) payload.status = updates.status;
      if ((updates as any).communication_summary !== undefined) payload.communication_summary = (updates as any).communication_summary;
      if ((updates as any).communication_channel !== undefined) payload.communication_channel = (updates as any).communication_channel;

      const updateRes = await fetch(`${API_BASE}/leads_update.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(payload)
      });

      if (!updateRes.ok) {
        const errorJson = await updateRes.json().catch(() => ({}));
        throw new Error(errorJson.error || 'Failed to update lead via PHP backend');
      }

      const updatedLead = { id: String(leadId), ...updates };

      // Submit to Google Sheets asynchronously in background
      submitToGoogleSheets({
        ...updatedLead,
        type: 'lead',
        isUpdate: true
      }).catch(() => {});

      return updatedLead;
    } catch (error) {
      console.error('Error updating lead:', error);
      throw new Error('Failed to update lead');
    }
  }

  // Delete a lead
  async deleteLead(leadId: string): Promise<void> {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/leads_delete.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({ id: Number(leadId) })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete lead');
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  // Helper methods
  private generateId(): string {
    return 'lead_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  generateFormattedLeadId(existingLeads: Lead[], purchasedDateStr?: string): string {
    const date = purchasedDateStr ? new Date(purchasedDateStr) : new Date();
    const year = date.getFullYear();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthAbbr = monthNames[date.getMonth()];
    const monthNum = String(date.getMonth() + 1).padStart(2, '0');
    
    const prefix1 = `LD${year}-${monthAbbr}-`;
    const prefix2 = `LD${year}-${monthNum}-`;
    
    let maxSeq = 0;
    existingLeads.forEach(l => {
      if (l.leadId) {
        if (l.leadId.startsWith(prefix1)) {
          const seqStr = l.leadId.substring(prefix1.length);
          const seq = parseInt(seqStr, 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        } else if (l.leadId.startsWith(prefix2)) {
          const seqStr = l.leadId.substring(prefix2.length);
          const seq = parseInt(seqStr, 10);
          if (!isNaN(seq) && seq > maxSeq) {
            maxSeq = seq;
          }
        }
      }
    });
    
    const nextSeq = String(maxSeq + 1).padStart(5, '0');
    return `${prefix1}${nextSeq}`;
  }

  async getLeadsByStatus(status: Lead['status']): Promise<Lead[]> {
    const allLeads = await this.getLeads();
    return allLeads.filter(lead => lead.status === status);
  }

  async getRecentLeads(days: number = 30): Promise<Lead[]> {
    const allLeads = await this.getLeads();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    return allLeads.filter(lead => 
      new Date(lead.createdAt) >= cutoffDate
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  // Get all expenses
  async getExpenses(): Promise<Expense[]> {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/expenses.php`, {
        headers: authHeaders
      });
      if (!res.ok) throw new Error('Failed to fetch expenses');
      const data = await res.json();
      const expenses = data.expenses || [];
      
      if (expenses.length === 0) {
        const stored = localStorage.getItem('crm_expenses');
        if (stored) {
          const seedExpenses = JSON.parse(stored);
          for (const item of seedExpenses) {
            await fetch(`${API_BASE}/expenses.php`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...authHeaders
              },
              body: JSON.stringify(mapExpenseToDb(item))
            });
          }
          return seedExpenses;
        }
        return [];
      }
      
      return expenses.map(mapExpenseFromDb);
    } catch (e) {
      console.error('Error fetching expenses:', e);
      return [];
    }
  }

  // Create new expense record
  async createExpense(expenseData: Omit<Expense, 'id' | 'createdDate'>): Promise<Expense> {
    try {
      const authHeaders = await getAuthHeader();
      const newId = 'exp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const expense: Expense = {
        id: newId,
        ...expenseData,
        leadSource: expenseData.leadSource || expenseData.subCategory,
        createdDate: new Date().toISOString()
      };

      const dbObj = mapExpenseToDb(expense);
      const res = await fetch(`${API_BASE}/expenses.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(dbObj)
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to create expense');
      }

      try {
        await submitToGoogleSheets({
          type: 'expense',
          expenseId: expense.id,
          id: expense.id,
          amount: expense.amount,
          paymentDate: expense.paymentDate,
          category: expense.category,
          subCategory: expense.subCategory,
          remarks: expense.remarks || '',
          vendorName: expense.vendorName || '',
          referenceNumber: expense.referenceNumber || '',
          createdBy: expense.createdBy,
          createdDate: expense.createdDate
        });
      } catch (sheetsErr) {
        console.error('Error submitting expense to Google Sheets:', sheetsErr);
      }

      return expense;
    } catch (e) {
      console.error('Error creating expense:', e);
      throw new Error('Failed to create expense');
    }
  }

  // Update expense record
  async updateExpense(expenseId: string, updates: Partial<Expense>): Promise<Expense> {
    try {
      const authHeaders = await getAuthHeader();
      
      // Fetch all expenses to find the original one
      const currentExpenses = await this.getExpenses();
      const oldExpense = currentExpenses.find(exp => exp.id === expenseId);
      
      if (!oldExpense) {
        throw new Error('Expense not found');
      }

      const updatedExpense: Expense = {
        ...oldExpense,
        ...updates,
        leadSource: updates.leadSource || updates.subCategory || oldExpense.leadSource || oldExpense.subCategory,
        modifiedDate: new Date().toISOString()
      };

      const dbObj = mapExpenseToDb(updatedExpense);
      delete dbObj.id;
      
      const res = await fetch(`${API_BASE}/expenses.php?id=${expenseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify(dbObj)
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to update expense');
      }

      try {
        await submitToGoogleSheets({
          type: 'expense',
          isUpdate: true,
          expenseId: updatedExpense.id,
          id: updatedExpense.id,
          amount: updatedExpense.amount,
          paymentDate: updatedExpense.paymentDate,
          category: updatedExpense.category,
          subCategory: updatedExpense.subCategory,
          remarks: updatedExpense.remarks || '',
          vendorName: updatedExpense.vendorName || '',
          referenceNumber: updatedExpense.referenceNumber || '',
          createdBy: updatedExpense.createdBy,
          createdDate: updatedExpense.createdDate,
          modifiedBy: updatedExpense.modifiedBy || 'agent@ghumofiroo.com',
          modifiedDate: updatedExpense.modifiedDate
        });
      } catch (sheetsErr) {
        console.error('Error syncing updated expense to Google Sheets:', sheetsErr);
      }

      return updatedExpense;
    } catch (e) {
      console.error('Error updating expense:', e);
      throw new Error('Failed to update expense');
    }
  }

  // Delete expense record
  async deleteExpense(expenseId: string): Promise<void> {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/expenses.php?id=${expenseId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to delete expense');
      }

      try {
        await submitToGoogleSheets({
          type: 'expense',
          isDelete: true,
          expenseId: expenseId,
          id: expenseId
        });
      } catch (sheetsErr) {
        console.error('Error syncing deleted expense to Google Sheets:', sheetsErr);
      }
    } catch (e) {
      console.error('Error deleting expense:', e);
      throw new Error('Failed to delete expense');
    }
  }

  // Restore leads from backup array
  async restoreLeadsBackup(leadsData: Lead[]): Promise<void> {
    try {
      for (const lead of leadsData) {
        if (!lead.id) continue;
        await supabase
          .from('leads')
          .delete()
          .eq('id', lead.id);

        const dbObj = mapLeadToDb(lead);
        await supabase
          .from('leads')
          .insert(dbObj);

        if (lead.payments && lead.payments.length > 0) {
          const dbPayments = lead.payments.map(p => mapPaymentToDb({ ...p, leadId: lead.id }));
          await supabase
            .from('payments')
            .insert(dbPayments);
        }

        if (lead.leadJourney && lead.leadJourney.length > 0) {
          const dbJourney = lead.leadJourney.map(j => mapJourneyToDb({ ...j, leadId: lead.id }));
          await supabase
            .from('lead_journey')
            .insert(dbJourney);
        }
      }
    } catch (e) {
      console.error('Error restoring backup:', e);
      throw new Error('Failed to restore backup');
    }
  }

  async logCommunication(leadId: string | number, channel: 'call' | 'whatsapp' | 'email' | 'sms' | 'note' | 'meeting', summary: string, direction: 'inbound' | 'outbound' | 'internal' = 'outbound'): Promise<void> {
    try {
      const authHeaders = await getAuthHeader();
      const res = await fetch(`${API_BASE}/communications.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        body: JSON.stringify({
          lead_id: Number(leadId),
          channel,
          summary,
          direction
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to log communication');
      }
    } catch (error) {
      console.error('Error logging communication:', error);
      throw error;
    }
  }
}

export const leadService = new LeadService();
export default leadService;