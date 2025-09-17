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

const SymbolSchema = z.string().min(1, 'Symbol cannot be empty');

const TokenMetadataBySymbolParamsSchema = z.object({
  network: NetworkSchema,
  symbol: SymbolSchema
});

export const TokenMetadataEndpointBySymbol = async (c: any) => {
  try {
    // Parse and validate parameters
    const { network, symbol } = TokenMetadataBySymbolParamsSchema.parse(c.req.param());

    console.log(`[TokenMetadataEndpointBySymbol] Network: ${network}, Symbol: ${symbol}`);

    // Check if network is supported
    if (!ethereumService.isNetworkSupported(network)) {
      console.log(`[TokenMetadataEndpointBySymbol] Unsupported network: ${network}`);
      throw new ApiException(`Unsupported network: ${network}. Supported networks: ${ethereumService.getSupportedNetworks().join(', ')}`);
    }

    // Check cache first
    const cachedData = cacheService.getBySymbol(network, symbol);
    if (cachedData) {
      console.log(`[TokenMetadataEndpointBySymbol] Cache hit for ${network}, ${symbol}`);
      return c.json(cachedData);
    }

    console.log(`[TokenMetadataEndpointBySymbol] Cache miss for ${network}, ${symbol}`);

    // For symbol-based lookup, we need to implement a different approach
    // Since we can't directly query by symbol from the blockchain,
    // we'll need to use a predefined mapping or external service
    console.log(`[TokenMetadataEndpointBySymbol] Symbol lookup not implemented yet for ${network}, ${symbol}`);


    
    throw new ApiException(`Symbol lookup not implemented. Please use address-based lookup instead.`);

  } catch (error) {
    console.log(`[TokenMetadataEndpointBySymbol] Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    
    if (error instanceof ApiException) {
      throw error;
    }

    if (error instanceof z.ZodError) {
      console.log(`[TokenMetadataEndpointBySymbol] Validation error: ${error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')}`);
      throw new ApiException(`Validation error: ${error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')}`);
    }

    // Handle Ethereum service errors
    if (error instanceof Error) {
      if (error.message.includes('Unsupported network')) {
        console.log(`[TokenMetadataEndpointBySymbol] Unsupported network error: ${error.message}`);
        throw new ApiException(error.message);
      }

      if (error.message.includes('Invalid symbol format')) {
        console.log(`[TokenMetadataEndpointBySymbol] Invalid symbol error: ${error.message}`);
        throw new ApiException(error.message);
      }

      if (error.message.includes('Failed to fetch token metadata')) {
        console.log(`[TokenMetadataEndpointBySymbol] Token not found error: ${error.message}`);
        throw new ApiException('Token not found or invalid contract');
      }
    }

    // Generic error
    console.log(`[TokenMetadataEndpointBySymbol] Generic error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw new ApiException('Internal server error');
  }
};