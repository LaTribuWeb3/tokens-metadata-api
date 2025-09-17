import { z } from 'zod';
import { ApiException } from 'chanfana';
import { ethereumService } from '../../services/ethereum';
import { cacheService } from '../../services/cache';
import { TokenMetadata } from '../../types';

// Validation schemas
const NetworkSchema = z.enum([
  'mainnet',
  'arbitrum', 
  'polygon',
  'optimism',
  'base',
  'sepolia',
  'arbitrum-sepolia',
  'polygon-mumbai'
]);

const AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid address format');

const TokenMetadataParamsSchema = z.object({
  network: NetworkSchema,
  address: AddressSchema
});

export const TokenMetadataEndpoint = async (c: any) => {
  try {
    // Parse and validate parameters
    const { network, address } = TokenMetadataParamsSchema.parse(c.req.param());

    // Check if network is supported
    if (!ethereumService.isNetworkSupported(network)) {
      throw new ApiException(`Unsupported network: ${network}. Supported networks: ${ethereumService.getSupportedNetworks().join(', ')}`);
    }

    console.log(`[TokenMetadataEndpoint] Network: ${network}, Address: ${address}`);

    // Check cache first
    const cachedData = cacheService.get(network, address);
    if (cachedData) {
      console.log(`[TokenMetadataEndpoint] Cache hit for ${network}, ${address}`);
      return c.json(cachedData);
    }

    console.log(`[TokenMetadataEndpoint] Cache miss for ${network}, ${address}`);

    // Fetch from Ethereum if not cached
    const tokenMetadata = await ethereumService.getTokenMetadata(network, address);

    console.log(`[TokenMetadataEndpoint] Fetched token metadata for ${network}, ${address}`);

    // Cache the result
    cacheService.set(network, address, tokenMetadata);

    return c.json(tokenMetadata);

  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      throw new ApiException(`Validation error: ${error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')}`);
    }

    // Handle Ethereum service errors
    if (error instanceof Error) {
      if (error.message.includes('Unsupported network')) {
        throw new ApiException(error.message);
      }

      if (error.message.includes('Invalid address format')) {
        throw new ApiException(error.message);
      }

      if (error.message.includes('Failed to fetch token metadata')) {
        throw new ApiException('Token not found or invalid contract');
      }
    }

    // Generic error
    throw new ApiException('Internal server error');
  }
};
