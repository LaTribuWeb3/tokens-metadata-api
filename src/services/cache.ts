import { TokenMetadata, CacheEntry } from '../types';
import fs from 'fs/promises';
import path from 'path';

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly CACHE_FILE_PATH: string;

  constructor(cacheFilePath?: string) {
    this.CACHE_FILE_PATH = cacheFilePath || path.join(process.cwd(), 'cache.json');
    this.loadCache();
  }

  private async loadCache(): Promise<void> {
    try {
      const cacheData = await fs.readFile(this.CACHE_FILE_PATH, 'utf-8');
      const cacheObject = JSON.parse(cacheData);
      this.cache = new Map(Object.entries(cacheObject));
      console.log(`Loaded ${this.cache.size} entries from cache file`);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty cache
      console.log('Cache file not found or invalid, starting with empty cache');
      this.cache = new Map();
    }
  }

  private async saveCache(): Promise<void> {
    try {
      const cacheObject = Object.fromEntries(this.cache);
      await fs.writeFile(this.CACHE_FILE_PATH, JSON.stringify(cacheObject, null, 2));
      console.log(`Saved ${this.cache.size} entries to cache file`);
    } catch (error) {
      // Log error but don't fail - cache should still work in memory
      console.warn('Failed to save cache to file (continuing with in-memory cache):', error);
    }
  }

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

  async setByAddress(network: string, address: string, data: TokenMetadata): Promise<void> {
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
    
    // Save cache to file after adding tokens
    await this.saveCache();
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

  async setBySymbol(network: string, symbol: string, data: TokenMetadata): Promise<void> {
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
    
    // Save cache to file after adding tokens
    await this.saveCache();
  }

  async clear(): Promise<void> {
    this.cache.clear();
    await this.saveCache();
  }

  // For debugging/monitoring
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// Cache service instance
export const cacheService = new CacheService();
