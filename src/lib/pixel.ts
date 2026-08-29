
export const PIXEL_ID = '1111618530664737';
const ENV: any = (import.meta as any)?.env || {};
const IS_DEV = !!ENV?.DEV;
const CAPI_URL: string = ENV?.VITE_CAPI_URL || '';
const ENABLE_CAPI: boolean = (!!ENV?.VITE_ENABLE_CAPI && ENV.VITE_ENABLE_CAPI === 'true') || (!!CAPI_URL && !!ENV?.PROD);

// Simple UUID generator if uuid package is missing (though we'll try to use crypto.randomUUID if available)
const generateEventId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface UserData {
  em?: string; // email
  ph?: string; // phone
  fn?: string; // first name
  ln?: string; // last name
  ct?: string; // city
  st?: string; // state
  zp?: string; // zip
  country?: string; // country
}

const sendToCAPI = async (eventName: string, eventId: string, eventData?: object, userData?: UserData) => {
  // Guard: Do not send from development or when not configured
  if (!ENABLE_CAPI || !CAPI_URL) {
    return;
  }
  // Fire and forget - don't await response to avoid blocking UI or throwing errors
  try {
    const payload = {
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      event_id: eventId,
      event_source_url: typeof window !== 'undefined' ? window.location.href : '',
      action_source: 'website',
      user_data: userData || {},
      custom_data: eventData || {},
    };

    // Use fetch without await to prevent blocking
    fetch(CAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true, // Important for tracking on navigation
    }).then(res => {
      // In production, fail silently to avoid console noise
      // Optionally log non-OK in dev only
      if (!res.ok && IS_DEV) {
        console.warn(`CAPI Error: ${res.status} ${res.statusText}`);
      }
    }).catch(err => {
      // Silently fail for network errors
      if (IS_DEV) {
        console.warn('CAPI warning (non-blocking): Backend not reachable or network error. Please verify VITE_CAPI_URL or AdBlocker settings.', err?.message || err);
      }
    });
  } catch (error) {
    // Catch synchronous errors in payload construction
    if (IS_DEV) {
      console.warn('CAPI construction error:', error);
    }
  }
};

// Standard Events
export const trackEvent = (eventName: string, data?: object, userData?: UserData) => {
  // Do not track Meta Pixel events on internal CRM or Auth routes
  if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/crm') || window.location.pathname.startsWith('/auth'))) {
    return;
  }

  const eventId = generateEventId();
  
  // Client-side Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', eventName, { ...data, eventID: eventId });
  }

  // Server-side CAPI
  sendToCAPI(eventName, eventId, data, userData);
};

// Custom Events
export const trackCustomEvent = (eventName: string, data?: object, userData?: UserData) => {
  const eventId = generateEventId();

  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('trackCustom', eventName, { ...data, eventID: eventId });
  }

  sendToCAPI(eventName, eventId, data, userData);
};

// Specific Helpers for Common ROAS Events
export const trackViewContent = (contentName: string, contentId: string, value: number, currency: string = 'INR', userData?: UserData) => {
  trackEvent('ViewContent', {
    content_name: contentName,
    content_ids: [contentId],
    content_type: 'product',
    value: value,
    currency: currency,
  }, userData);
};

export const trackAddToCart = (contentName: string, contentId: string, value: number, currency: string = 'INR', userData?: UserData) => {
  trackEvent('AddToCart', {
    content_name: contentName,
    content_ids: [contentId],
    content_type: 'product',
    value: value,
    currency: currency,
  }, userData);
};

export const trackInitiateCheckout = (contentName: string, contentId: string, value: number, currency: string = 'INR', userData?: UserData) => {
  trackEvent('InitiateCheckout', {
    content_name: contentName,
    content_ids: [contentId],
    content_type: 'product',
    value: value,
    currency: currency,
    num_items: 1,
  }, userData);
};

export const trackPurchase = (contentName: string, contentId: string, value: number, currency: string = 'INR', userData?: UserData) => {
  trackEvent('Purchase', {
    content_name: contentName,
    content_ids: [contentId],
    content_type: 'product',
    value: value,
    currency: currency,
    num_items: 1,
  }, userData);
};

export const trackLead = (contentName?: string, userData?: UserData, eventMetadata?: object) => {
  trackEvent('Lead', {
    content_name: contentName,
    content_category: 'Lead',
    ...eventMetadata
  }, userData);
};

export const trackSearch = (searchString: string, userData?: UserData) => {
  trackEvent('Search', {
    search_string: searchString,
  }, userData);
};
