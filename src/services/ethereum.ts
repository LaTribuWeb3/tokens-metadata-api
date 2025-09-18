import { TokenMetadata, NetworkConfig, ChainListRPC } from '../types';
import { createPublicClient, http, parseAbi } from 'viem';

// ERC-20 ABI for token metadata functions
const ERC20_ABI = parseAbi([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)'
]);

// Cache for RPC list and network configs
let rpcListCache: ChainListRPC[] | null = null;
let networkConfigsCache: Record<string, NetworkConfig> | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export class EthereumService {
  private async fetchRPCList(): Promise<ChainListRPC[]> {
    try {
      console.log('[EthereumService] Fetching RPC list from chainlist.org');
      const response = await fetch('https://chainlist.org/rpcs.json');
      
      if (!response.ok) {
        throw new Error(`Failed to fetch RPC list: ${response.status} ${response.statusText}`);
      }
      
      const rpcList = await response.json() as ChainListRPC[];
      console.log(`[EthereumService] Fetched ${rpcList.length} RPC configurations`);
      return rpcList;
    } catch (error) {
      console.error('[EthereumService] Error fetching RPC list:', error);
      throw new Error(`Failed to fetch RPC list: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getNetworkConfigs(): Promise<Record<string, NetworkConfig>> {
    const now = Date.now();
    
    // Return cached configs if they exist and are not expired
    if (networkConfigsCache && (now - lastFetchTime) < CACHE_DURATION) {
      console.log('[EthereumService] Using cached network configs');
      return networkConfigsCache;
    }

    try {
      // Fetch fresh RPC list
      const rpcList = await this.fetchRPCList();
      rpcListCache = rpcList;
      
      // Build network configs for all available networks
      const configs: Record<string, NetworkConfig> = {};
      
      for (const chain of rpcList) {
        if (chain.chainSlug && chain.rpc && chain.rpc.length > 0) {
          const firstRpc = chain.rpc[0];
          
          // Extract URL from RPC object (chainlist.org returns objects with url property)
          const rpcUrl = typeof firstRpc === 'string' ? firstRpc : firstRpc?.url;
          
          // Ensure rpcUrl is a string
          if (typeof rpcUrl === 'string' && rpcUrl.startsWith('http')) {
            configs[chain.chainSlug] = {
              name: chain.name,
              rpcUrl: rpcUrl,
              chainId: chain.chainId,
              chainSlug: chain.chainSlug
            };
            console.log(`[EthereumService] Configured ${chain.chainSlug}: ${rpcUrl}`);
          } else {
            console.warn(`[EthereumService] Invalid RPC URL for ${chain.chainSlug}:`, rpcUrl);
          }
        } else {
          console.warn(`[EthereumService] Skipping chain ${chain.chainSlug || 'unknown'}: no valid RPC found`);
        }
      }
      
      // Cache the results
      networkConfigsCache = configs;
      lastFetchTime = now;
      
      return configs;
    } catch (error) {
      console.error('[EthereumService] Error building network configs:', error);
      
      // If we have cached configs, use them as fallback
      if (networkConfigsCache) {
        console.log('[EthereumService] Using stale cached configs as fallback');
        return networkConfigsCache;
      }
      
      throw error;
    }
  }

  private createViemClient(rpcUrl: string) {
    // Validate that rpcUrl is a proper string
    if (typeof rpcUrl !== 'string' || !rpcUrl.startsWith('http')) {
      throw new Error(`Invalid RPC URL: ${rpcUrl} (type: ${typeof rpcUrl})`);
    }
    
    
    return createPublicClient({
      transport: http(rpcUrl),
    });
  }

  private async callContract(network: string, address: string, functionName: string): Promise<any> {
    const networkConfigs = await this.getNetworkConfigs();
    const networkConfig = networkConfigs[network];
    
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    console.log(`[EthereumService] Calling contract on ${networkConfig.rpcUrl}`);

    try {
      const client = this.createViemClient(networkConfig.rpcUrl);
      
      // First, check if the address is actually a contract
      const code = await client.getCode({ address: address as `0x${string}` });
      if (!code || code === '0x') {
        throw new Error(`Address ${address} is not a contract on ${network} network`);
      }
      
      const result = await client.readContract({
        address: address as `0x${string}`,
        abi: ERC20_ABI,
        functionName: functionName as 'name' | 'symbol' | 'decimals',
      });

      return result;
    } catch (error) {
      console.error(`[EthereumService] Error calling contract function ${functionName}:`, error);
      console.error(`[EthereumService] Network: ${network}, Address: ${address}, RPC: ${networkConfig.rpcUrl}`);
      
      // Provide more specific error messages
      if (error instanceof Error) {
        if (error.message.includes('returned no data')) {
          throw new Error(`Contract at ${address} on ${network} network does not have the ${functionName}() function or is not an ERC-20 token. This address may not be deployed on this network or may be a different type of contract.`);
        }
        if (error.message.includes('is not a contract')) {
          throw new Error(`Address ${address} is not a contract on ${network} network. Please verify the contract address is correct for this network.`);
        }
      }
      
      throw new Error(`Contract call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }


  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  private warnAboutKnownTokenAddresses(network: string, address: string): void {
    const knownTokens: Record<string, Record<string, string>> = {
      'ethereum': {
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC (Ethereum Mainnet)',
        '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT (Ethereum Mainnet)',
        '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI (Ethereum Mainnet)'
      },
      'arbitrum-one': {
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831': 'USDC (Arbitrum One)',
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9': 'USDT (Arbitrum One)'
      },
      'polygon-pos': {
        '0x2791bca1f2de4661ed88a30c99a7a9449aa84174': 'USDC (Polygon)',
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f': 'USDT (Polygon)'
      }
    };

    const lowerAddress = address.toLowerCase();
    
    // Check if this is a known token address for a different network
    for (const [net, tokens] of Object.entries(knownTokens)) {
      if (net !== network && tokens[lowerAddress]) {
        console.warn(`[EthereumService] Warning: ${tokens[lowerAddress]} is known on ${net} network, but you're querying ${network} network. This may cause errors if the token is not deployed on ${network}.`);
        break;
      }
    }
  }

  async getTokenMetadataByAddress(network: string, address: string): Promise<TokenMetadata> {
    console.log(`[EthereumService] Getting token metadata for ${network}, ${address}`);

    // Get network configs and validate network
    const networkConfigs = await this.getNetworkConfigs();
    if (!networkConfigs[network]) {
      throw new Error(`Unsupported network: ${network}`);
    }

    console.log(`[EthereumService] Network: ${network}`);

    // Validate address format
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid address format: ${address}`);
    }

    console.log(`[EthereumService] Address: ${address}`);
    
    // Check if this is a known token address that might not exist on this network
    this.warnAboutKnownTokenAddresses(network, address);

    try {
      // Fetch token metadata in parallel using Viem
      const [name, symbol, decimals] = await Promise.all([
        this.callContract(network, address, 'name'),
        this.callContract(network, address, 'symbol'),
        this.callContract(network, address, 'decimals')
      ]);

      console.log(`[EthereumService] Name: ${name}`);
      console.log(`[EthereumService] Symbol: ${symbol}`);
      console.log(`[EthereumService] Decimals: ${decimals}`);

      return {
        address: address.toLowerCase(),
        name: name as string,
        symbol: symbol as string,
        decimals: decimals as number,
        cached: false,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to fetch token metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getSupportedNetworks(): Promise<string[]> {
    const networkConfigs = await this.getNetworkConfigs();
    return Object.keys(networkConfigs);
  }

  async isNetworkSupported(network: string): Promise<boolean> {
    const networkConfigs = await this.getNetworkConfigs();
    return network in networkConfigs;
  }
}

export const ethereumService = new EthereumService();
