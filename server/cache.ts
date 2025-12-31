/**
 * Cloudflare KV Caching Service
 * 
 * This module provides caching functionality using Cloudflare KV store
 * for improved performance and scalability.
 * 
 * KV Namespace: equine-wisdom-cache
 * Namespace ID: 3f914209bd5a45f08e8124fc7e681bc4
 */

// Cache key prefixes for organization
export const CACHE_KEYS = {
  BREED: 'breed:',
  BREED_LIST: 'breeds:list',
  BREED_BY_CATEGORY: 'breeds:category:',
  FACTS: 'facts:',
  FACTS_BY_CATEGORY: 'facts:category:',
  SEARCH_RESULT: 'search:',
  POPULAR_BREEDS: 'popular:breeds',
} as const;

// TTL values in seconds
export const CACHE_TTL = {
  BREED: 86400,        // 24 hours for individual breeds
  BREED_LIST: 3600,    // 1 hour for breed lists
  FACTS: 86400,        // 24 hours for facts
  SEARCH: 1800,        // 30 minutes for search results
  POPULAR: 3600,       // 1 hour for popular items
} as const;

/**
 * In-memory cache fallback for development
 * In production, this would be replaced with Cloudflare KV API calls
 */
const memoryCache = new Map<string, { value: string; expiry: number }>();

/**
 * Get a value from cache
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  // Check memory cache first (development fallback)
  const cached = memoryCache.get(key);
  if (cached) {
    if (Date.now() < cached.expiry) {
      try {
        return JSON.parse(cached.value) as T;
      } catch {
        return null;
      }
    } else {
      memoryCache.delete(key);
    }
  }
  return null;
}

/**
 * Set a value in cache with TTL
 */
export async function cacheSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  const stringValue = JSON.stringify(value);
  const expiry = Date.now() + (ttlSeconds * 1000);
  memoryCache.set(key, { value: stringValue, expiry });
}

/**
 * Delete a value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  memoryCache.delete(key);
}

/**
 * Delete all values matching a prefix
 */
export async function cacheDeleteByPrefix(prefix: string): Promise<void> {
  const keysToDelete: string[] = [];
  memoryCache.forEach((_, key) => {
    if (key.startsWith(prefix)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => memoryCache.delete(key));
}

/**
 * Get breed from cache or fetch from database
 */
export async function getCachedBreed<T>(
  breedId: number,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cacheKey = `${CACHE_KEYS.BREED}${breedId}`;
  
  // Try cache first
  const cached = await cacheGet<T>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from database
  const data = await fetchFn();
  
  // Store in cache
  if (data) {
    await cacheSet(cacheKey, data, CACHE_TTL.BREED);
  }
  
  return data;
}

/**
 * Get breed list from cache or fetch from database
 */
export async function getCachedBreedList<T>(
  category: string | null,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cacheKey = category 
    ? `${CACHE_KEYS.BREED_BY_CATEGORY}${category}`
    : CACHE_KEYS.BREED_LIST;
  
  // Try cache first
  const cached = await cacheGet<T>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from database
  const data = await fetchFn();
  
  // Store in cache
  if (data) {
    await cacheSet(cacheKey, data, CACHE_TTL.BREED_LIST);
  }
  
  return data;
}

/**
 * Get facts from cache or fetch from database
 */
export async function getCachedFacts<T>(
  category: string | null,
  fetchFn: () => Promise<T>
): Promise<T> {
  const cacheKey = category
    ? `${CACHE_KEYS.FACTS_BY_CATEGORY}${category}`
    : CACHE_KEYS.FACTS;
  
  // Try cache first
  const cached = await cacheGet<T>(cacheKey);
  if (cached) {
    return cached;
  }
  
  // Fetch from database
  const data = await fetchFn();
  
  // Store in cache
  if (data) {
    await cacheSet(cacheKey, data, CACHE_TTL.FACTS);
  }
  
  return data;
}

/**
 * Invalidate breed cache when data is updated
 */
export async function invalidateBreedCache(breedId?: number): Promise<void> {
  if (breedId) {
    await cacheDelete(`${CACHE_KEYS.BREED}${breedId}`);
  }
  // Also invalidate list caches
  await cacheDeleteByPrefix(CACHE_KEYS.BREED_LIST);
  await cacheDeleteByPrefix(CACHE_KEYS.BREED_BY_CATEGORY);
  await cacheDelete(CACHE_KEYS.POPULAR_BREEDS);
}

/**
 * Invalidate facts cache when data is updated
 */
export async function invalidateFactsCache(): Promise<void> {
  await cacheDeleteByPrefix(CACHE_KEYS.FACTS);
  await cacheDeleteByPrefix(CACHE_KEYS.FACTS_BY_CATEGORY);
}

/**
 * Get cache statistics for monitoring
 */
export function getCacheStats(): { size: number; keys: string[] } {
  return {
    size: memoryCache.size,
    keys: Array.from(memoryCache.keys()),
  };
}
