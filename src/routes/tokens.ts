import express, { Request, Response } from 'express';
import { getTokenMetadata } from '../controllers/tokens';
import { ErrorResponse } from '../types';

const router = express.Router();

// GET /tokens/{network}/{address} - Get token metadata
router.get('/:network/:address', async (req: Request, res: Response) => {
  try {
    const { network, address } = req.params;
    
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
