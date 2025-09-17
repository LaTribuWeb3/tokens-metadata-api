import type { Context } from "hono";

export type AppContext = Context<{ Bindings: Env }>;
export type HandleArgs = [AppContext];

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
