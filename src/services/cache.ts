import { TokenMetadata, CacheEntry } from '../types';

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  getByAddress(network: string, address: string): TokenMetadata | null {
    const key = `${network}:address:${address.toLowerCase()}`;
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

  setByAddress(network: string, address: string, data: TokenMetadata): void {
    const key = `${network}:address:${address.toLowerCase()}`;
    const keyBySymbol = `${network}:symbol:${data.symbol.toUpperCase()}`;

    const entry: CacheEntry = {
      data: {
        ...data,
        cached: false // Store as non-cached in the cache entry
      },
      timestamp: Date.now(),
      ttl: this.TTL
    };

    this.cache.set(key, entry);
    this.cache.set(keyBySymbol, entry);
  }

  getBySymbol(network: string, symbol: string): TokenMetadata | null {
    const key = `${network}:symbol:${symbol.toUpperCase()}`;
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

  setBySymbol(network: string, symbol: string, data: TokenMetadata): void {
    const key = `${network}:symbol:${symbol.toUpperCase()}`;
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
