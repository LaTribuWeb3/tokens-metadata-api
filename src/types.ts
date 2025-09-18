import { Request } from 'express';

export interface TokenMetadata {
  address: string;
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
  chainSlug: string;
}

export interface ChainListRPC {
  chainSlug: string;
  chainId: number;
  name: string;
  rpc: Array<{
    url: string;
    tracking?: string;
    isOpenSource?: boolean;
  }>;
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

export interface JWTPayload {
  userId: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}
