export type AnalyticsParams = Record<string, any>;

function getDefaultContext(): AnalyticsParams {
  try {
    const loc = window.location;
    const pathname = (loc?.pathname || '').toLowerCase();
    const search = loc?.search || '';
    const params = new URLSearchParams(search);

    // Derive page_type from route patterns
    let page_type = 'page';
    if (pathname.startsWith('/packages/')) page_type = 'package_detail';
    else if (pathname.startsWith('/packages')) page_type = 'packages_list';
    else if (pathname.startsWith('/guides')) page_type = 'guide';
    else if (pathname.startsWith('/enquire-now')) page_type = 'enquiry';
    else if (pathname.startsWith('/enquire-success')) page_type = 'enquiry_success';
    else if (pathname === '/' || pathname.startsWith('/home')) page_type = 'home';

    // Infer package_slug from URL path
    let package_slug: string | undefined;
    const pkgMatch = pathname.match(/^\/packages\/(.+)$/);
    if (pkgMatch) {
      package_slug = pkgMatch[1].replace(/\/$/, '');
    }

    // Capture potential search query param
    const query = params.get('query') || params.get('q') || undefined;

    return {
      page_type,
      package_slug,
      query,
      page_location: loc?.href,
      page_path: pathname,
      page_title: document?.title,
    };
  } catch {
    return {};
  }
}

function normalizeEventName(eventName: string): string {
  const ev = (eventName || '').toLowerCase();
  // Map legacy/specific names to GA4 canonical names
  if (ev === 'enquire_whatsapp_click' || ev === 'contact_whatsapp_click') return 'whatsapp_click';
  if (ev === 'enquire_submit') return 'enquiry_submit';
  return eventName;
}

// Local popularity tracking helpers
function updateCounter(storeKey: string, id: string, meta: any = null) {
  if (!id) return;
  try {
    const raw = localStorage.getItem(storeKey);
    const map: Record<string, { count: number; meta?: any; lastAt: number }> = raw ? JSON.parse(raw) : {};
    const prev = map[id];
    map[id] = {
      count: (prev?.count || 0) + 1,
      meta: meta ?? prev?.meta,
      lastAt: Date.now(),
    };
    // Trim to top ~50 entries by count to bound storage
    const entries = Object.entries(map).sort((a, b) => b[1].count - a[1].count).slice(0, 50);
    const pruned = Object.fromEntries(entries);
    localStorage.setItem(storeKey, JSON.stringify(pruned));
  } catch {
    // ignore storage errors
  }
}

export function pushEvent(eventName: string, params: AnalyticsParams = {}) {
  try {
    // Suppress marketing analytics for internal CRM and Auth panels
    if (typeof window !== 'undefined' && (window.location.pathname.startsWith('/crm') || window.location.pathname.startsWith('/auth'))) {
      return;
    }

    const finalEventName = normalizeEventName(eventName);
    const defaultCtx = getDefaultContext();
    const payload = { event: finalEventName, ...defaultCtx, ...params };

    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(payload);

    if (typeof (window as any).gtag === "function") {
      (window as any).gtag("event", finalEventName, payload);
    }

    // Mirror selected events into localStorage for dynamic suggestions
    const ev = (finalEventName || '').toLowerCase();
    if (ev === 'packages_view_details' || ev === 'package_card_click') {
      const id = params?.id || params?.slug || params?.packageId || params?.package_id || null;
      const name = params?.name || params?.title || null;
      updateCounter('popular_packages', String(id || ''), { name });
    }
    if (ev === 'packages_prefill_query' || ev === 'packages_search' || ev === 'packages_filter_search') {
      const q = params?.query || params?.q || null;
      if (q) updateCounter('popular_queries', String(q).toLowerCase());
    }
  } catch {
    // no-op
  }
}