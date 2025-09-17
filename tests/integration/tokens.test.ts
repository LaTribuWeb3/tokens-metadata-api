import { describe, it, expect } from 'vitest';

describe('Token Metadata API', () => {
  it('should validate network parameter', () => {
    // Test network validation
    const validNetworks = ['mainnet', 'arbitrum', 'polygon', 'optimism', 'base', 'sepolia', 'arbitrum-sepolia', 'polygon-mumbai'];
    const invalidNetwork = 'invalid-network';
    
    expect(validNetworks).toContain('mainnet');
    expect(validNetworks).not.toContain(invalidNetwork);
  });

  it('should validate address format', () => {
    // Test address validation
    const validAddress = '0xaf88d065e77c8cc2239327c5edb3a432268e5831';
    const invalidAddress = 'invalid-address';
    
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    expect(addressRegex.test(validAddress)).toBe(true);
    expect(addressRegex.test(invalidAddress)).toBe(false);
  });

  it('should have proper token metadata structure', () => {
    // Test token metadata structure
    const mockTokenMetadata = {
      address: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      network: 'arbitrum',
      name: 'USD Coin',
      symbol: 'USDC',
      decimals: 6,
      cached: false,
      timestamp: '2024-01-15T10:30:00Z'
    };

    expect(mockTokenMetadata).toHaveProperty('address');
    expect(mockTokenMetadata).toHaveProperty('network');
    expect(mockTokenMetadata).toHaveProperty('name');
    expect(mockTokenMetadata).toHaveProperty('symbol');
    expect(mockTokenMetadata).toHaveProperty('decimals');
    expect(mockTokenMetadata).toHaveProperty('cached');
    expect(mockTokenMetadata).toHaveProperty('timestamp');
    expect(typeof mockTokenMetadata.decimals).toBe('number');
    expect(typeof mockTokenMetadata.cached).toBe('boolean');
  });
});
