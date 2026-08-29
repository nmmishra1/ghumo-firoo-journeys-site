import { supabase } from '@/integrations/supabase/client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/php-backend';

export interface QuoteItem {
  type: 'hotel' | 'excursion' | 'transfer' | 'flight' | 'visa' | 'meal';
  name: string;
  detail: string;
  qty: number;
  rate: number;
  total: number;
}

export interface QuoteVersion {
  id: string;
  versionNumber: number;
  totalCost: number;
  margin: number; // percentage
  sellingPrice: number;
  status: 'Draft' | 'Shared' | 'Viewed' | 'Discussion' | 'Revised' | 'Accepted' | 'Rejected' | 'Expired' | 'Confirmed';
  createdBy: string;
  createdAt: string;
  items: QuoteItem[];
  itineraryDays?: { day: number; title: string; description: string }[];
  parentQuoteId?: string;
  sharedAt?: string;
  viewedAt?: string;
  expiresAt?: string;
  shareToken?: string;
  shareMessage?: string;
}

export interface QuoteHeader {
  id: string;
  quoteNumber: string;
  customerName: string;
  destination: string;
  leadCities?: string[];
  currentVersion: number;
  status: string;
  decisionStatus: 'Interested' | 'Need Revision' | 'Thinking' | 'Budget Issue' | 'Lost' | 'Confirmed';
  versions: QuoteVersion[];
}

export const quoteService = {
  // Helper to group flat quote rows into QuoteHeader trees
  groupQuotes(rows: any[]): QuoteHeader[] {
    const groups: Record<number, any[]> = {};
    rows.forEach(r => {
      const lid = r.lead_id;
      if (!groups[lid]) groups[lid] = [];
      groups[lid].push(r);
    });
    
    return Object.keys(groups).map(lid => {
      const list = groups[Number(lid)];
      // Sort versions by version_number ascending
      list.sort((a, b) => a.version_number - b.version_number);
      const latest = list[list.length - 1];
      
      return {
        id: list[0].id,
        quoteNumber: `QT-2026-${String(lid).padStart(3, '0')}`,
        customerName: latest.customer_name || 'Guest',
        destination: latest.package_name,
        currentVersion: latest.version_number,
        status: latest.status,
        decisionStatus: latest.status === 'Accepted' ? 'Confirmed' : latest.status === 'Rejected' ? 'Lost' : 'Interested',
        versions: list.map(v => {
          const breakdown = v.cost_breakdown;
          const itemsList = (breakdown && Array.isArray(breakdown.items)) ? breakdown.items : [];
          const itineraryDaysList = (breakdown && Array.isArray(breakdown.itineraryDays)) ? breakdown.itineraryDays : [];
          const marginVal = (breakdown && typeof breakdown.margin === 'number') ? breakdown.margin : 10;
          const costVal = (breakdown && typeof breakdown.hotels === 'number') ? breakdown.hotels : v.total_amount * 0.9;
          
          return {
            id: v.id,
            versionNumber: v.version_number,
            totalCost: costVal,
            margin: marginVal,
            sellingPrice: v.total_amount,
            status: v.status,
            createdBy: v.created_by || 'Agent',
            createdAt: new Date(v.created_at).toLocaleString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
            items: itemsList,
            itineraryDays: itineraryDaysList,
            parentQuoteId: v.parent_quote_id,
            sharedAt: v.shared_at,
            viewedAt: v.viewed_at,
            expiresAt: v.expires_at,
            shareToken: v.share_token,
            shareMessage: v.share_message
          };
        })
      };
    });
  },

  // 1. Save or revise a quote
  async saveQuote(quotePayload: {
    id: string | null;
    lead_id: number;
    itinerary_id: string | null;
    package_name: string;
    total_amount: number;
    cost_breakdown: { hotels: number; transport: number; sightseeing: number };
    inclusions: string[];
    exclusions: string[];
    terms?: string;
    validity_days?: number;
    notes?: string;
  }): Promise<{ success: boolean; quote_id: string; version: number }> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch(`${API_BASE}/quotes_save.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify(quotePayload)
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to save quote');
    }

    return res.json();
  },

  // 2. Fetch list of quotes for a lead
  async getQuotesForLead(leadId: number): Promise<QuoteVersion[]> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch(`${API_BASE}/quotes_list.php?lead_id=${leadId}`, {
      headers: {
        'Authorization': `Bearer ${token || ''}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch quote history');
    }

    const data = await res.json();
    return data.quotes || [];
  },

  // 3. Fetch single quote by UUID
  async getQuote(quoteId: string): Promise<any> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch(`${API_BASE}/quotes_get.php?id=${quoteId}`, {
      headers: {
        'Authorization': `Bearer ${token || ''}`
      }
    });

    if (!res.ok) {
      throw new Error('Failed to fetch quote details');
    }

    const data = await res.json();
    return data.quote;
  },

  // 4. Generate share link
  async shareQuote(quoteId: string, message?: string, recipientEmail?: string): Promise<{ success: boolean; share_url: string; token: string }> {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.access_token;

    const res = await fetch(`${API_BASE}/quote_share.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token || ''}`
      },
      body: JSON.stringify({
        quote_id: quoteId,
        message,
        recipient_email: recipientEmail
      })
    });

    if (!res.ok) {
      throw new Error('Failed to generate share link');
    }

    return res.json();
  },

  // 5. Public view by token
  async publicGetQuote(tokenStr: string): Promise<any> {
    const res = await fetch(`${API_BASE}/quote_view.php?token=${tokenStr}`);
    if (!res.ok) {
      throw new Error('Failed to load shared quote details');
    }
    const data = await res.json();
    return data.quote;
  },

  // 6. Public action by token
  async publicSubmitAction(tokenStr: string, action: 'accept' | 'discuss' | 'reject', message?: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/quote_action.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: tokenStr,
        action,
        message
      })
    });
    if (!res.ok) {
      throw new Error('Failed to submit response');
    }
    const data = await res.json();
    return !!data.success;
  }
};
