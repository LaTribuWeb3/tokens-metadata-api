import { describe, it, expect, beforeEach } from 'vitest';
import { CacheService } from '../src/services/cache';
import { TokenMetadata } from '../src/types';

describe('Cache Persistence', () => {
  let cacheService: CacheService;

  beforeEach(() => {
    // Create a new cache service instance for each test
    cacheService = new CacheService('./test-cache.json');
  });

  it('should add tokens to cache and maintain them in memory', async () => {
    const mockTokenMetadata: TokenMetadata = {
      address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      network: 'arbitrum',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      cached: false,
      timestamp: '2024-01-15T10:30:00Z'
    };

    // Add token to cache
    await cacheService.setByAddress('arbitrum', '0xaf88d065e77c8cc2239327c5edb3a432268e5831', mockTokenMetadata);

    // Verify token is in cache
    const cachedData = cacheService.getByAddress('arbitrum', '0xaf88d065e77c8cc2239327c5edb3a432268e5831');
    expect(cachedData).toBeDefined();
    expect(cachedData?.name).toBe('USD Coin');
    expect(cachedData?.symbol).toBe('USDC');
    expect(cachedData?.cached).toBe(true); // Should be marked as cached when retrieved

    // Verify symbol lookup also works
    const symbolData = cacheService.getBySymbol('arbitrum', 'USDC');
    expect(symbolData).toBeDefined();
    expect(symbolData?.name).toBe('USD Coin');
  });

  it('should handle cache operations without errors', async () => {
    const mockTokenMetadata: TokenMetadata = {
      address: '0x1234567890123456789012345678901234567890',
      network: 'mainnet',
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      cached: false,
      timestamp: '2024-01-15T10:30:00Z'
    };

    // Test setByAddress
    await cacheService.setByAddress('mainnet', '0x1234567890123456789012345678901234567890', mockTokenMetadata);
    
    // Test setBySymbol
    await cacheService.setBySymbol('mainnet', 'TEST', mockTokenMetadata);

    // Verify both entries exist
    const addressData = cacheService.getByAddress('mainnet', '0x1234567890123456789012345678901234567890');
    const symbolData = cacheService.getBySymbol('mainnet', 'TEST');
    
    expect(addressData).toBeDefined();
    expect(symbolData).toBeDefined();
    expect(addressData?.name).toBe('Test Token');
    expect(symbolData?.name).toBe('Test Token');
  });

  it('should handle missing cache file gracefully', () => {
    // Create cache service with non-existent file path
    const cacheService = new CacheService('./non-existent-cache.json');
    
    // Should not throw error and should have empty cache
    const stats = cacheService.getStats();
    expect(stats.size).toBe(0);
  });

  it('should clear cache successfully', async () => {
    const mockTokenMetadata: TokenMetadata = {
      address: '0x1234567890123456789012345678901234567890',
      network: 'mainnet',
      name: 'Test Token',
      symbol: 'TEST',
      decimals: 18,
      cached: false,
      timestamp: '2024-01-15T10:30:00Z'
    };

    // Add token to cache
    await cacheService.setByAddress('mainnet', '0x1234567890123456789012345678901234567890', mockTokenMetadata);
    
    // Verify it's there
    expect(cacheService.getStats().size).toBe(2); // address + symbol entries
    
    // Clear cache
    await cacheService.clear();
    
    // Verify it's empty
    expect(cacheService.getStats().size).toBe(0);
  });
});
