/**
 * CRM In-Memory API Cache & Request Deduplicator
 * Prevents redundant heavy JSON downloads and eliminates duplicate back-to-back requests.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const inFlightPromises = new Map<string, Promise<any>>();

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes default TTL

/**
 * Fetch JSON with in-memory caching & in-flight request deduplication.
 */
export async function fetchCachedJson<T = any>(
  url: string,
  options?: RequestInit,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const cacheKey = url;

  // 1. Return from memory cache if fresh
  const cached = memoryCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data as T;
  }

  // 2. Return existing in-flight request if already being fetched
  if (inFlightPromises.has(cacheKey)) {
    return inFlightPromises.get(cacheKey) as Promise<T>;
  }

  // 3. Perform fresh network request
  const fetchPromise = (async () => {
    try {
      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      
      // Save to memory cache
      memoryCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });

      return data as T;
    } finally {
      // Clean up in-flight promise map
      inFlightPromises.delete(cacheKey);
    }
  })();

  inFlightPromises.set(cacheKey, fetchPromise);
  return fetchPromise;
}

/**
 * Invalidate cache entry or clear entire cache (e.g. after add/edit/delete mutations).
 */
export function clearCrmCache(urlKey?: string): void {
  if (urlKey) {
    memoryCache.delete(urlKey);
    // Also clear any prefix matches (e.g. /php-backend/hotels.php)
    for (const key of Array.from(memoryCache.keys())) {
      if (key.includes(urlKey)) {
        memoryCache.delete(key);
      }
    }
  } else {
    memoryCache.clear();
  }
}
