import { getUrl } from 'aws-amplify/storage';

type CacheEntry = {
  url: string;
  expiresAt: number;
};

const TTL_MS = 10 * 60 * 1000; // 10 minutes (signed URLs are valid ~15 min)
const cache = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<string | null>>();

/**
 * Cached wrapper around Amplify's getUrl(). Returns a signed URL for
 * the given storage path, reusing a cached result when available.
 * Deduplicates concurrent requests for the same path.
 */
export async function getCachedUrl(path: string): Promise<string | null> {
  const now = Date.now();
  const cached = cache.get(path);
  if (cached && cached.expiresAt > now) {
    return cached.url;
  }

  const existing = inflight.get(path);
  if (existing) return existing;

  const promise = (async () => {
    try {
      const result = await getUrl({ path });
      const url = result.url.toString();
      cache.set(path, { url, expiresAt: now + TTL_MS });
      return url;
    } catch {
      return null;
    } finally {
      inflight.delete(path);
    }
  })();

  inflight.set(path, promise);
  return promise;
}

export function clearUrlCache() {
  cache.clear();
}
