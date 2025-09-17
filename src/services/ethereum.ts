import { TokenMetadata, NetworkConfig } from '../types';

// ERC-20 function selectors for token metadata
const ERC20_SELECTORS = {
  name: '0x06fdde03', // name()
  symbol: '0x95d89b41', // symbol()
  decimals: '0x313ce567' // decimals()
};

// Network configurations
const NETWORKS: Record<string, NetworkConfig> = {
  mainnet: {
    name: 'mainnet',
    rpcUrl: 'https://eth.llamarpc.com',
    chainId: 1
  },
  arbitrum: {
    name: 'arbitrum',
    rpcUrl: 'https://arb-mainnet.g.alchemy.com/v2/demo',
    chainId: 42161
  },
  polygon: {
    name: 'polygon',
    rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/demo',
    chainId: 137
  },
  optimism: {
    name: 'optimism',
    rpcUrl: 'https://opt-mainnet.g.alchemy.com/v2/demo',
    chainId: 10
  },
  base: {
    name: 'base',
    rpcUrl: 'https://base-mainnet.g.alchemy.com/v2/demo',
    chainId: 8453
  },
  sepolia: {
    name: 'sepolia',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/demo',
    chainId: 11155111
  },
  'arbitrum-sepolia': {
    name: 'arbitrum-sepolia',
    rpcUrl: 'https://arb-sepolia.g.alchemy.com/v2/demo',
    chainId: 421614
  },
  'polygon-mumbai': {
    name: 'polygon-mumbai',
    rpcUrl: 'https://polygon-mumbai.g.alchemy.com/v2/demo',
    chainId: 80001
  }
};

export class EthereumService {
  private async makeRpcCall(rpcUrl: string, method: string, params: any[]): Promise<any> {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method,
        params,
        id: 1,
      }),
    });

    if (!response.ok) {
      throw new Error(`RPC call failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as any;
    
    if (data.error) {
      throw new Error(`RPC error: ${data.error.message}`);
    }

    return data.result;
  }

  private async callContract(network: string, address: string, data: string): Promise<string> {
    const networkConfig = NETWORKS[network];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${network}`);
    }

    console.log(`[EthereumService] Calling contract on ${networkConfig.rpcUrl}`);

    const result = await this.makeRpcCall(networkConfig.rpcUrl, 'eth_call', [
      {
        to: address,
        data: data,
      },
      'latest',
    ]);

    return result;
  }

  private decodeStringResponse(hexData: string): string {
    // Remove 0x prefix and decode the hex string
    const hex = hexData.slice(2);
    
    // For string return types, the first 32 bytes contain the offset to the actual string data
    const offset = parseInt(hex.slice(0, 64), 16) * 2;
    
    // The next 32 bytes contain the length of the string
    const length = parseInt(hex.slice(offset, offset + 64), 16) * 2;
    
    // Extract the actual string data
    const stringHex = hex.slice(offset + 64, offset + 64 + length);
    
    // Convert hex to string
    let result = '';
    for (let i = 0; i < stringHex.length; i += 2) {
      const byte = parseInt(stringHex.substr(i, 2), 16);
      if (byte !== 0) {
        result += String.fromCharCode(byte);
      }
    }
    return result;
  }

  private decodeUint8Response(hexData: string): number {
    // Remove 0x prefix and decode the uint8
    const hex = hexData.slice(2);
    // For uint8, the value is in the last 2 characters (right-padded to 32 bytes)
    return parseInt(hex.slice(hex.length - 2), 16);
  }

  private isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  async getTokenMetadataByAddress(network: string, address: string): Promise<TokenMetadata> {
    console.log(`[EthereumService] Getting token metadata for ${network}, ${address}`);

    // Validate network
    if (!NETWORKS[network]) {
      throw new Error(`Unsupported network: ${network}`);
    }

    console.log(`[EthereumService] Network: ${network}`);

    // Validate address format
    if (!this.isValidAddress(address)) {
      throw new Error(`Invalid address format: ${address}`);
    }

    console.log(`[EthereumService] Address: ${address}`);

    try {
      // Fetch token metadata in parallel
      const [nameResult, symbolResult, decimalsResult] = await Promise.all([
        this.callContract(network, address, ERC20_SELECTORS.name),
        this.callContract(network, address, ERC20_SELECTORS.symbol),
        this.callContract(network, address, ERC20_SELECTORS.decimals)
      ]);

      console.log(`[EthereumService] Name: ${nameResult}`);
      console.log(`[EthereumService] Symbol: ${symbolResult}`);
      console.log(`[EthereumService] Decimals: ${decimalsResult}`);

      const name = this.decodeStringResponse(nameResult);
      const symbol = this.decodeStringResponse(symbolResult);
      const decimals = this.decodeUint8Response(decimalsResult);

      console.log(`[EthereumService] Name: ${name}`);
      console.log(`[EthereumService] Symbol: ${symbol}`);
      console.log(`[EthereumService] Decimals: ${decimals}`);

      return {
        address: address.toLowerCase(),
        network,
        name,
        symbol,
        decimals,
        cached: false,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`Failed to fetch token metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTokenMetadataBySymbol(network: string, symbol: string): Promise<TokenMetadata> {
    console.log(`[EthereumService] Getting token metadata for ${network}, ${symbol}`);

    // Validate network
    if (!NETWORKS[network]) {
      throw new Error(`Unsupported network: ${network}`);
    }

    console.log(`[EthereumService] Network: ${network}`);

    
  }

  getSupportedNetworks(): string[] {
    return Object.keys(NETWORKS);
  }

  isNetworkSupported(network: string): boolean {
    return network in NETWORKS;
  }
}

export const ethereumService = new EthereumService();
