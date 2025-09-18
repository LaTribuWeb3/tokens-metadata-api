import { TokenMetadata } from '../types';
import fs from 'fs/promises';
import path from 'path';

interface NetworkCache {
  [network: string]: TokenMetadata[];
}

export class CacheService {
  private cache: NetworkCache = {};
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly CACHE_FILE_PATH: string;

  constructor(cacheFilePath?: string) {
    this.CACHE_FILE_PATH = cacheFilePath || path.join(process.cwd(), 'cache.json');
    this.loadCache();
  }

  private async loadCache(): Promise<void> {
    try {
      const cacheData = await fs.readFile(this.CACHE_FILE_PATH, 'utf-8');
      this.cache = JSON.parse(cacheData);
      const totalTokens = Object.values(this.cache).reduce((sum, tokens) => sum + tokens.length, 0);
      console.log(`Loaded ${totalTokens} tokens across ${Object.keys(this.cache).length} networks from cache file`);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty cache
      console.log('Cache file not found or invalid, starting with empty cache');
      this.cache = {};
    }
  }

  private async saveCache(): Promise<void> {
    try {
      await fs.writeFile(this.CACHE_FILE_PATH, JSON.stringify(this.cache, null, 2));
      const totalTokens = Object.values(this.cache).reduce((sum, tokens) => sum + tokens.length, 0);
      console.log(`Saved ${totalTokens} tokens across ${Object.keys(this.cache).length} networks to cache file`);
    } catch (error) {
      // Log error but don't fail - cache should still work in memory
      console.warn('Failed to save cache to file (continuing with in-memory cache):', error);
    }
  }

  getByAddress(network: string, address: string): TokenMetadata | null {
    const networkTokens = this.cache[network];
    if (!networkTokens) {
      return null;
    }

    const token = networkTokens.find(t => 
      t.address.toLowerCase() === address.toLowerCase()
    );

    if (!token) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    const tokenTimestamp = new Date(token.timestamp).getTime();
    if (now - tokenTimestamp > this.TTL) {
      // Remove expired token
      this.cache[network] = networkTokens.filter(t => 
        t.address.toLowerCase() !== address.toLowerCase()
      );
      this.saveCache(); // Save after removing expired token
      return null;
    }

    // Return cached data with cached flag set to true
    return {
      ...token,
      cached: true
    };
  }

  async setByAddress(network: string, address: string, data: TokenMetadata): Promise<void> {
    // Initialize network array if it doesn't exist
    if (!this.cache[network]) {
      this.cache[network] = [];
    }

    // Remove existing token with same address if it exists
    this.cache[network] = this.cache[network].filter(t => 
      t.address.toLowerCase() !== address.toLowerCase()
    );

    // Add new token with current timestamp
    const tokenToCache: TokenMetadata = {
      ...data,
      cached: false, // Store as non-cached in the cache entry
      timestamp: new Date().toISOString()
    };

    this.cache[network].push(tokenToCache);
    
    // Save cache to file after adding token
    await this.saveCache();
  }

  getBySymbol(network: string, symbol: string): TokenMetadata | null {
    const networkTokens = this.cache[network];
    if (!networkTokens) {
      return null;
    }

    const token = networkTokens.find(t => 
      t.symbol.toUpperCase() === symbol.toUpperCase()
    );

    if (!token) {
      return null;
    }

    // Check if entry has expired
    const now = Date.now();
    const tokenTimestamp = new Date(token.timestamp).getTime();
    if (now - tokenTimestamp > this.TTL) {
      // Remove expired token
      this.cache[network] = networkTokens.filter(t => 
        t.symbol.toUpperCase() !== symbol.toUpperCase()
      );
      this.saveCache(); // Save after removing expired token
      return null;
    }

    // Return cached data with cached flag set to true
    return {
      ...token,
      cached: true
    };
  }

  async setBySymbol(network: string, symbol: string, data: TokenMetadata): Promise<void> {
    // Initialize network array if it doesn't exist
    if (!this.cache[network]) {
      this.cache[network] = [];
    }

    // Remove existing token with same symbol if it exists
    this.cache[network] = this.cache[network].filter(t => 
      t.symbol.toUpperCase() !== symbol.toUpperCase()
    );

    // Add new token with current timestamp
    const tokenToCache: TokenMetadata = {
      ...data,
      cached: false, // Store as non-cached in the cache entry
      timestamp: new Date().toISOString()
    };

    this.cache[network].push(tokenToCache);
    
    // Save cache to file after adding token
    await this.saveCache();
  }

  async clear(): Promise<void> {
    this.cache = {};
    await this.saveCache();
  }

  // For debugging/monitoring
  getStats(): { totalTokens: number; networks: string[]; tokensPerNetwork: { [network: string]: number } } {
    const networks = Object.keys(this.cache);
    const totalTokens = Object.values(this.cache).reduce((sum, tokens) => sum + tokens.length, 0);
    const tokensPerNetwork = networks.reduce((acc, network) => {
      acc[network] = this.cache[network].length;
      return acc;
    }, {} as { [network: string]: number });

    return {
      totalTokens,
      networks,
      tokensPerNetwork
    };
  }
}

// Cache service instance
export const cacheService = new CacheService();
