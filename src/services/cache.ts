import { TokenMetadata, CacheEntry } from '../types';

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  private getCacheKey(network: string, address: string): string {
    return `${network}:${address.toLowerCase()}`;
  }

  get(network: string, address: string): TokenMetadata | null {
    const key = this.getCacheKey(network, address);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Return cached data with cached flag set to true
    return {
      ...entry.data,
      cached: true
    };
  }

  set(network: string, address: string, data: TokenMetadata): void {
    const key = this.getCacheKey(network, address);
    const entry: CacheEntry = {
      data: {
        ...data,
        cached: false // Store as non-cached in the cache entry
      },
      timestamp: Date.now(),
      ttl: this.TTL
    };

    this.cache.set(key, entry);
  }

  clear(): void {
    this.cache.clear();
  }

  // For debugging/monitoring
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

export const cacheService = new CacheService();
