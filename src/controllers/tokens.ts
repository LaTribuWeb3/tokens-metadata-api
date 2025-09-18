import { ethereumService } from '../services/ethereum';
import { cacheService } from '../services/cache';
import { TokenMetadata, ErrorResponse } from '../types';

export async function getTokenMetadata(network: string, address: string): Promise<TokenMetadata> {
  console.log(`[getTokenMetadata] Network: ${network}, Address: ${address}`);

  // Check cache first
  const cachedData = cacheService.getByAddress(network, address);
  if (cachedData) {
    console.log(`[getTokenMetadata] Cache hit for ${network}, ${address}`);
    return cachedData;
  }

  console.log(`[getTokenMetadata] Cache miss for ${network}, ${address}`);

  // Check if network is supported
  if (!(await ethereumService.isNetworkSupported(network))) {
    const supportedNetworks = (await ethereumService.getSupportedNetworks()).join(', ');
    throw new Error(`Unsupported network: ${network}. Supported networks: ${supportedNetworks}`);
  }

  // Fetch from Ethereum if not cached
  const tokenMetadata = await ethereumService.getTokenMetadataByAddress(network, address);

  console.log(`[getTokenMetadata] Fetched token metadata for ${network}, ${address}`);

  // Cache the result
  await cacheService.setByAddress(network, address, tokenMetadata);

  return tokenMetadata;
}
