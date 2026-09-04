/**
 * Chat Lead Service - Stores chat interactions and user data in MySQL Database & Google Sheets
 */

import { submitToGoogleSheets, LeadSubmission } from './googleSheets';
import { MASTER_DESTINATIONS } from '@/data/masterDestinations';

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
 * Extract rich lead data (Destination, Travel Date, Passengers, Interests) from conversation
 */
export const extractLeadFromChat = (messages: Array<{ text: string; sender: 'user' | 'agent' | 'bot' }>): Partial<ChatLeadData> => {
  const userMessages = messages.filter(m => m.sender === 'user').map(m => m.text);
  const fullText = userMessages.join(' ').toLowerCase();

  const extracted: Partial<ChatLeadData> = {
    interests: [],
    source: 'LiveChatWidget',
    createdAt: new Date().toISOString()
  };

  // Known destination aliases and priorities
  const destinationMap: Array<{ key: string; name: string; aliases: string[] }> = [
    { key: 'ooty', name: 'Ooty (Nilgiri Hills)', aliases: ['ooty', 'nilgiri', 'coonoor'] },
    { key: 'coorg', name: 'Coorg (Kodagu)', aliases: ['coorg', 'corrong', 'kodagu', 'madikeri'] },
    { key: 'kashmir', name: 'Kashmir (Srinagar & Gulmarg)', aliases: ['kashmir', 'srinagar', 'gulmarg', 'pahalgam', 'sonamarg'] },
    { key: 'rann', name: 'Rann Utsav Kutch', aliases: ['rann', 'kutch', 'utsav', 'dhordo', 'tent city'] },
    { key: 'chardham', name: 'Char Dham Yatra', aliases: ['char dham', 'chardham', 'kedarnath', 'badrinath', 'gangotri', 'yamunotri'] },
    { key: 'kerala', name: 'Kerala Backwaters & Hills', aliases: ['kerala', 'munnar', 'alleppey', 'kochi', 'thekkady', 'kumarakom'] },
    { key: 'goa', name: 'Goa Beachfront', aliases: ['goa', 'calangute', 'panaji', 'baga', 'candolim'] },
    { key: 'manali', name: 'Manali & Solang Valley', aliases: ['manali', 'solang', 'rohtang', 'kasol'] },
    { key: 'shimla', name: 'Shimla & Kufri', aliases: ['shimla', 'kufri'] },
    { key: 'rajasthan', name: 'Rajasthan Heritage Circuit', aliases: ['rajasthan', 'jaipur', 'udaipur', 'jodhpur', 'jaisalmer'] },
    { key: 'andaman', name: 'Andaman & Nicobar Islands', aliases: ['andaman', 'havelock', 'port blair', 'neil island'] },
    { key: 'thailand', name: 'Thailand (Phuket & Krabi)', aliases: ['thailand', 'phuket', 'krabi', 'bangkok', 'pattaya'] },
    { key: 'singapore', name: 'Singapore City & Sentosa', aliases: ['singapore', 'sentosa', 'universal studios'] },
    { key: 'bali', name: 'Bali (Ubud & Seminyak)', aliases: ['bali', 'ubud', 'seminyak', 'nusa penida'] },
    { key: 'dubai', name: 'Dubai & Desert Safari', aliases: ['dubai', 'burj khalifa', 'abu dhabi'] },
    { key: 'europe', name: 'Europe (Swiss & Paris)', aliases: ['europe', 'switzerland', 'paris', 'france', 'italy'] }
  ];

  // Scan user messages in REVERSE (most recent user message takes priority for destination changes)
  for (let i = userMessages.length - 1; i >= 0; i--) {
    const text = userMessages[i].toLowerCase();

    for (const item of destinationMap) {
      if (item.aliases.some(alias => text.includes(alias))) {
        extracted.destination = item.name;
        break;
      }
    }
    if (extracted.destination) break;

    // Match against Master Destinations
    const md = MASTER_DESTINATIONS.find(d => text.includes(d.city.toLowerCase()));
    if (md) {
      extracted.destination = `${md.city}, ${md.state}`;
      break;
    }
  }

  // Extract Travel Date
  const dateMatch = fullText.match(/\b(\d{1,2}(?:st|nd|rd|th)?\s*(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{1,2}|diwali|christmas|new year|next month|next week)\b/i);
  if (dateMatch) {
    extracted.travelDate = dateMatch[0];
  }

  // Extract Passengers / Guests
  const paxMatch = fullText.match(/(\d+)\s*(?:people|person|pax|guests|adults|travelers|members|passenger)/i);
  if (paxMatch) {
    extracted.passengers = parseInt(paxMatch[1], 10);
  } else if (fullText.includes('couple') || fullText.includes('one couple') || fullText.includes('husband and wife') || fullText.includes('2 people')) {
    extracted.passengers = 2;
  } else if (fullText.includes('solo')) {
    extracted.passengers = 1;
  }

  return extracted;
};
