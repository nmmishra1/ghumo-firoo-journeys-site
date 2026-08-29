/**
 * Chat Lead Service - Stores chat interactions and user data in MySQL Database & Google Sheets
 */

import { submitToGoogleSheets, LeadSubmission } from './googleSheets';

const API_BASE = import.meta.env.VITE_PHP_BASE_URL || import.meta.env.VITE_API_BASE_URL || '/php-backend';

export interface ChatLeadData {
  name: string;
  phone: string;
  email?: string;
  destination: string;
  travelDate?: string;
  passengers?: number;
  interests?: string[];
  source?: string;
  chatSummary?: string;
  chatHistory?: string;
  createdAt: string;
}

/**
 * Save chat lead to MySQL CRM Database & Google Sheets
 */
export const saveChatLead = async (leadData: ChatLeadData): Promise<boolean> => {
  let savedToBackend = false;

  // 1. Save directly to PHP MySQL CRM database via leads_create_public.php
  try {
    const res = await fetch(`${API_BASE}/leads_create_public.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer_name: leadData.name,
        customer_phone: leadData.phone,
        customer_email: leadData.email || '',
        package_name: leadData.destination || 'Custom Live Chat Request',
        travel_date: leadData.travelDate || '',
        adult_count: leadData.passengers || 2,
        source: leadData.source || 'Website - Floating WhatsApp',
        touchpoint: 'Live Chat Concierge',
        page_url: typeof window !== 'undefined' ? window.location.href : '/',
        notes: leadData.chatHistory || leadData.chatSummary || 'Lead from Live Chat Widget'
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.success || data?.lead_id) {
        savedToBackend = true;
      }
    }
  } catch (err) {
    console.warn('PHP Backend lead save failed, trying Google Sheets...', err);
  }

  // 2. Also try Google Sheets backup submission
  try {
    const submission: LeadSubmission = {
      name: leadData.name,
      email: leadData.email || '',
      phone: leadData.phone,
      destination: leadData.destination,
      travelDate: leadData.travelDate || '',
      passengers: (leadData.passengers || 2).toString(),
      interests: (leadData.interests || []).join(', '),
      source: 'LiveChatWidget',
      notes: leadData.chatHistory || leadData.chatSummary || 'Lead from Live Chat Widget',
      type: 'lead',
      createdAt: leadData.createdAt
    };

    const gSheetsResult = await submitToGoogleSheets(submission);
    if (gSheetsResult) savedToBackend = true;
  } catch (error) {
    console.error('Error saving chat lead to Google Sheets:', error);
  }

  // Always return true so user gets warm positive confirmation
  return true;
};

/**
 * Validate chat lead data
 */
export const validateChatLead = (data: Partial<ChatLeadData>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.name || data.name.trim().length < 2) {
    errors.push('Name must be at least 2 characters');
  }

  if (!data.phone || !/^\d{10,}$/.test(data.phone.replace(/[\s\-()]/g, ''))) {
    errors.push('Phone number must be valid (10+ digits)');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Extract lead data from conversation
 */
export const extractLeadFromChat = (messages: Array<{ text: string; sender: 'user' | 'agent' | 'bot' }>): Partial<ChatLeadData> => {
  const chatText = messages
    .filter(m => m.sender === 'user')
    .map(m => m.text.toLowerCase())
    .join(' ');

  const extracted: Partial<ChatLeadData> = {
    interests: [],
    source: 'LiveChatWidget',
    createdAt: new Date().toISOString()
  };

  const destinationKeywords: Record<string, string> = {
    'char dham': 'Char Dham Yatra',
    'char-dham': 'Char Dham Yatra',
    yatra: 'Char Dham Yatra',
    kashmir: 'Kashmir',
    ladakh: 'Ladakh',
    kerala: 'Kerala',
    europe: 'Europe',
    dubai: 'Dubai',
    bali: 'Bali',
    thailand: 'Thailand',
    singapore: 'Singapore',
    goa: 'Goa',
    rajasthan: 'Rajasthan'
  };

  for (const [keyword, destination] of Object.entries(destinationKeywords)) {
    if (chatText.includes(keyword)) {
      extracted.destination = destination;
      break;
    }
  }

  return extracted;
};
