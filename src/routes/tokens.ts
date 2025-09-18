import express, { Request, Response } from 'express';
import { getTokenMetadata } from '../controllers/tokens';
import { ErrorResponse, AuthenticatedRequest } from '../types';
import { verifyToken } from '../middleware/auth';

const router = express.Router();

// GET /tokens/{network}/{address} - Get token metadata (requires authentication)
router.get('/:network/:address', verifyToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { network, address } = req.params;
    
    // User information is available in req.user after JWT verification
    console.log(`[Token Request] User: ${req.user?.userId}, Network: ${network}, Address: ${address}`);
    
    // Basic validation
    if (!network || !address) {
      const errorResponse: ErrorResponse = {
        success: false,
        errors: [{
          code: 400,
          message: 'Network and address parameters are required'
        }]
      };
      return res.status(400).json(errorResponse);
    }

    // Validate address format
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(address)) {
      const errorResponse: ErrorResponse = {
        success: false,
        errors: [{
          code: 400,
          message: 'Invalid address format. Must be a valid Ethereum address (0x followed by 40 hex characters)'
        }]
      };
      return res.status(400).json(errorResponse);
    }

    // Validate network
    const supportedNetworks = ['mainnet', 'arbitrum', 'polygon', 'optimism', 'base', 'sepolia', 'arbitrum-sepolia', 'polygon-mumbai'];
    if (!supportedNetworks.includes(network)) {
      const errorResponse: ErrorResponse = {
        success: false,
        errors: [{
          code: 400,
          message: `Unsupported network: ${network}. Supported networks: ${supportedNetworks.join(', ')}`
        }]
      };
      return res.status(400).json(errorResponse);
    }

    const result = await getTokenMetadata(network, address);
    res.json(result);
  } catch (error) {
    console.error('Error in token metadata route:', error);
    
    const errorResponse: ErrorResponse = {
      success: false,
      errors: [{
        code: 500,
        message: error instanceof Error ? error.message : 'Internal server error'
      }]
    };
    
    res.status(500).json(errorResponse);
  }
});

export { router as tokensRouter };
