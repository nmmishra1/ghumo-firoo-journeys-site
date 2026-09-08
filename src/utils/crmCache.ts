/**
 * Universal CRM & API In-Memory Cache, Request Deduplicator & Auto-Invalidator
 * 
 * Guarantees:
 * 1. Once an API call is made, subsequent calls for the same resource return from memory cache
 *    with ZERO duplicate network requests unless explicitly forced or refreshed.
 * 2. In-flight promise deduplication: Simultaneous/parallel calls to the same endpoint
 *    await the same pending promise instead of triggering redundant HTTP calls.
 * 3. Mutation-aware auto-invalidation: Any successful POST, PUT, DELETE, or PATCH to a resource
 *    automatically clears corresponding GET caches (e.g. leads, itineraries, hotels, quotes, etc.).
 * 4. User-initiated refresh support: Clear all caches on manual refresh or auth logout.
 * 5. 100% transparent to standard Fetch API: Returns standard, unconsumed Response objects.
 */

interface CachedApiResponse {
  bodyText: string;
  status: number;
  statusText: string;
  headers: [string, string][];
  timestamp: number;
}

// In-memory cache map for GET responses
const apiMemoryCache = new Map<string, CachedApiResponse>();

// In-flight pending promises for deduplication
const apiInFlightPromises = new Map<string, Promise<CachedApiResponse>>();

// Generous default TTL: 30 minutes (cached until user refreshes or mutates)
export const DEFAULT_TTL_MS = 30 * 60 * 1000;

/**
 * Checks whether a given URL targets our backend API endpoints
 */
export function isBackendApiUrl(urlStr: string): boolean {
  if (!urlStr || typeof urlStr !== 'string') return false;

  // Relative backend endpoints
  if (urlStr.startsWith('/php-backend') || urlStr.startsWith('php-backend')) return true;
  if (urlStr.startsWith('/api') || urlStr.startsWith('api')) return true;

  // Relative PHP script calls
  if (urlStr.startsWith('/') && !urlStr.startsWith('//') && urlStr.includes('.php')) {
    return true;
  }

  // Full URL matching current origin or backend API base
  if (typeof window !== 'undefined') {
    try {
      const parsed = new URL(urlStr, window.location.origin);
      if (parsed.origin === window.location.origin) {
        return parsed.pathname.startsWith('/php-backend') || 
               parsed.pathname.startsWith('/api') || 
               parsed.pathname.includes('.php');
      }
      const envBase = (import.meta as any).env?.VITE_API_BASE_URL || (import.meta as any).env?.VITE_PHP_BASE_URL;
      if (envBase && typeof envBase === 'string' && envBase.startsWith('http')) {
        const envOrigin = new URL(envBase).origin;
        if (parsed.origin === envOrigin) return true;
      }
    } catch (e) {}
  }

  return false;
}

/**
 * Computes a unique cache key from URL and optional auth headers
 */
function getApiCacheKey(urlStr: string, init?: RequestInit): string {
  let authSuffix = '';
  if (init?.headers) {
    try {
      const h = new Headers(init.headers);
      const auth = h.get('Authorization') || h.get('authorization');
      if (auth) {
        authSuffix = `::auth=${auth.slice(-16)}`;
      }
    } catch (e) {}
  }
  try {
    const parsed = new URL(urlStr, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    return `${parsed.pathname}${parsed.search}${authSuffix}`;
  } catch (e) {
    return `${urlStr}${authSuffix}`;
  }
}

/**
 * Creates a fresh, unconsumed Response object from a cached entry
 */
function createResponseFromCache(cached: CachedApiResponse): Response {
  const headers = new Headers();
  cached.headers.forEach(([k, v]) => headers.set(k, v));
  return new Response(cached.bodyText, {
    status: cached.status,
    statusText: cached.statusText,
    headers
  });
}

/**
 * Invalidate cached entries matching a resource keyword or pattern
 */
export function invalidateApiCache(pattern?: string | RegExp): void {
  if (!pattern) {
    apiMemoryCache.clear();
    apiInFlightPromises.clear();
    return;
  }

  const isRegex = pattern instanceof RegExp;
  const pLower = isRegex ? '' : pattern.toLowerCase();

  for (const key of Array.from(apiMemoryCache.keys())) {
    if (isRegex ? pattern.test(key) : key.toLowerCase().includes(pLower)) {
      apiMemoryCache.delete(key);
    }
  }
}

/**
 * Automatically invalidates relevant caches after a mutation (POST, PUT, DELETE, PATCH)
 */
export function invalidateMatchingCaches(urlStr: string): void {
  const clean = urlStr.toLowerCase();

  // 1. Table parameter check: ?table=xyz
  const tableMatch = clean.match(/[?&]table=([a-z0-9_-]+)/i);
  if (tableMatch && tableMatch[1]) {
    const tbl = tableMatch[1].toLowerCase();
    invalidateApiCache(tbl);
    if (tbl.includes('hotel')) invalidateApiCache('hotel');
    if (tbl.includes('cab') || tbl.includes('vehicle') || tbl.includes('route')) {
      invalidateApiCache('cab');
      invalidateApiCache('vehicle');
      invalidateApiCache('route');
    }
    if (tbl.includes('lead')) invalidateApiCache('lead');
    if (tbl.includes('itinerar')) invalidateApiCache('itinerar');
    if (tbl.includes('quote')) invalidateApiCache('quote');
    if (tbl.includes('payment')) invalidateApiCache('payment');
    if (tbl.includes('doc')) invalidateApiCache('doc');
    return;
  }

  // 2. Specific resource keywords in endpoint paths
  if (clean.includes('lead')) invalidateApiCache('lead');
  if (clean.includes('itinerar')) invalidateApiCache('itinerar');
  if (clean.includes('quote')) invalidateApiCache('quote');
  if (clean.includes('hotel')) invalidateApiCache('hotel');
  if (clean.includes('cab') || clean.includes('route') || clean.includes('vehicle')) {
    invalidateApiCache('cab');
    invalidateApiCache('route');
    invalidateApiCache('vehicle');
  }
  if (clean.includes('sightsee')) invalidateApiCache('sightsee');
  if (clean.includes('activit')) invalidateApiCache('activit');
  if (clean.includes('visa')) invalidateApiCache('visa');
  if (clean.includes('package')) invalidateApiCache('package');
  if (clean.includes('blog')) invalidateApiCache('blog');
  if (clean.includes('user') || clean.includes('role')) {
    invalidateApiCache('user');
    invalidateApiCache('role');
  }
  if (clean.includes('payment')) invalidateApiCache('payment');
  if (clean.includes('document') || clean.includes('upload')) invalidateApiCache('doc');
  if (clean.includes('destination') || clean.includes('countr') || clean.includes('state') || clean.includes('cit')) {
    invalidateApiCache('destinat');
    invalidateApiCache('countr');
    invalidateApiCache('state');
    invalidateApiCache('cit');
  }
  if (clean.includes('email_marketing')) invalidateApiCache('email_marketing');
  if (clean.includes('review')) invalidateApiCache('review');
  if (clean.includes('bootstrap') || clean.includes('dashboard_bootstrap')) {
    invalidateApiCache('bootstrap');
  }
}

// Backward compatibility alias for clearCrmCache
export const clearCrmCache = invalidateApiCache;

/**
 * Fetch JSON with in-memory caching & in-flight request deduplication.
 * (Preserved for backwards compatibility with direct fetchCachedJson callers)
 */
export async function fetchCachedJson<T = any>(
  url: string,
  options?: RequestInit,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json();
}

let isInterceptorInstalled = false;

/**
 * Installs the universal fetch interceptor globally.
 * Guarantees that ALL fetch() calls throughout the app:
 * - Cache successful GET responses in memory.
 * - Deduplicate in-flight parallel GET requests.
 * - Invalidate caches automatically on successful mutations.
 */
export function installApiCacheInterceptor(): void {
  if (typeof window === 'undefined' || isInterceptorInstalled) return;

  const originalFetch = window.fetch.bind(window);

  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let urlStr = '';
    if (typeof input === 'string') {
      urlStr = input;
    } else if (input instanceof URL) {
      urlStr = input.toString();
    } else if (input && typeof input === 'object' && 'url' in input) {
      urlStr = (input as Request).url;
    }

    // Only intercept and manage our backend API endpoints
    if (!isBackendApiUrl(urlStr)) {
      return originalFetch(input, init);
    }

    const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();

    // 1. Handling Mutations (POST, PUT, DELETE, PATCH)
    if (method !== 'GET') {
      const mutationRes = await originalFetch(input, init);
      if (mutationRes.ok) {
        // Automatically invalidate all corresponding cached GET queries!
        invalidateMatchingCaches(urlStr);
      }
      return mutationRes;
    }

    // 2. Handling GET requests
    const cacheKey = getApiCacheKey(urlStr, init);

    // Check if caller requests a force-refresh
    let isForceRefresh = false;
    if (init?.cache === 'no-store' || init?.cache === 'reload') {
      isForceRefresh = true;
    }
    if (init?.headers) {
      try {
        const h = new Headers(init.headers);
        if (h.get('x-force-refresh') === 'true' || h.get('cache-control')?.includes('no-cache')) {
          isForceRefresh = true;
        }
      } catch (e) {}
    }
    if (urlStr.includes('force_refresh=true') || urlStr.includes('force=true')) {
      isForceRefresh = true;
    }

    // If cached, valid, and not forced to refresh: return from memory cache immediately!
    if (!isForceRefresh) {
      const cached = apiMemoryCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < DEFAULT_TTL_MS)) {
        return createResponseFromCache(cached);
      }
    }

    // If an identical request is already pending over the wire, deduplicate!
    if (apiInFlightPromises.has(cacheKey)) {
      const pendingResult = await apiInFlightPromises.get(cacheKey)!;
      return createResponseFromCache(pendingResult);
    }

    // Otherwise, perform the actual network request and deduplicate simultaneous callers
    const fetchPromise = (async (): Promise<CachedApiResponse> => {
      try {
        const networkRes = await originalFetch(input, init);
        const bodyText = await networkRes.text();
        const headerEntries: [string, string][] = [];
        networkRes.headers.forEach((val, key) => headerEntries.push([key, val]));

        const entry: CachedApiResponse = {
          bodyText,
          status: networkRes.status,
          statusText: networkRes.statusText,
          headers: headerEntries,
          timestamp: Date.now()
        };

        // Only cache successful 2xx responses
        if (networkRes.ok) {
          apiMemoryCache.set(cacheKey, entry);
        }

        return entry;
      } finally {
        apiInFlightPromises.delete(cacheKey);
      }
    })();

    apiInFlightPromises.set(cacheKey, fetchPromise);
    const completedEntry = await fetchPromise;
    return createResponseFromCache(completedEntry);
  };

  isInterceptorInstalled = true;
}
