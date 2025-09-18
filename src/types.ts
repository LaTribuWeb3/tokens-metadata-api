export interface TokenMetadata {
  address: string;
  network: string;
  name: string;
  symbol: string;
  decimals: number;
  cached: boolean;
  timestamp: string;
}

export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  chainId: number;
}

export interface CacheEntry {
  data: TokenMetadata;
  timestamp: number;
  ttl: number;
}

export interface ErrorResponse {
  success: false;
  errors: Array<{
    code: number;
    message: string;
  }>;
}

export type ApiResponse<T = any> = {
  success: true;
  data?: T;
} | ErrorResponse;
