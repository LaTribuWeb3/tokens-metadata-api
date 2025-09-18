import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { JWTPayload, AuthenticatedRequest, ErrorResponse } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

export function verifyToken(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      const errorResponse: ErrorResponse = {
        success: false,
        errors: [{
          code: 401,
          message: 'Authorization header is required'
        }]
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Check if the header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      const errorResponse: ErrorResponse = {
        success: false,
        errors: [{
          code: 401,
          message: 'Authorization header must start with "Bearer "'
        }]
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Extract the token
    const token = authHeader.substring(7); // Remove "Bearer " prefix

    if (!token) {
      const errorResponse: ErrorResponse = {
        success: false,
        errors: [{
          code: 401,
          message: 'Token is required'
        }]
      };
      res.status(401).json(errorResponse);
      return;
    }

    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    
    // Attach the decoded payload to the request
    (req as AuthenticatedRequest).user = decoded;
    
    next();
  } catch (error) {
    console.error('JWT verification error:', error);
    
    let message = 'Invalid token';
    if (error instanceof jwt.TokenExpiredError) {
      message = 'Token has expired';
    } else if (error instanceof jwt.JsonWebTokenError) {
      message = 'Invalid token format';
    }

    const errorResponse: ErrorResponse = {
      success: false,
      errors: [{
        code: 401,
        message
      }]
    };
    
    res.status(401).json(errorResponse);
  }
}

// Helper function to generate a JWT token (for testing purposes)
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}
