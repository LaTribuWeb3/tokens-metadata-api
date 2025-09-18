import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { tokensRouter } from './routes/tokens';
import { ErrorResponse } from './types';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API documentation endpoint (serving the swagger.json)
app.get('/', (req, res) => {
  res.json({
    title: "Token Metadata API",
    version: "1.0.0",
    description: "API for fetching token metadata from Ethereum networks",
    endpoints: {
      "GET /tokens/{network}/{address}": "Get token metadata by address",
      "GET /health": "Health check endpoint"
    }
  });
});

// Routes
app.use('/tokens', tokensRouter);

// Global error handler
app.use((err: any, req: Request, res: Response, next: express.NextFunction) => {
  console.error('Global error handler caught:', err);
  
  const errorResponse: ErrorResponse = {
    success: false,
    errors: [{
      code: err.status || 500,
      message: err.message || 'Internal Server Error'
    }]
  };
  
  res.status(err.status || 500).json(errorResponse);
});

// 404 handler
app.use('*', (req: Request, res: Response) => {
  const errorResponse: ErrorResponse = {
    success: false,
    errors: [{
      code: 404,
      message: `Route ${req.method} ${req.originalUrl} not found`
    }]
  };
  
  res.status(404).json(errorResponse);
});

// Start server
app.listen(PORT, () => {
  console.log(`Token Metadata API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API documentation: http://localhost:${PORT}/`);
});

export default app;
