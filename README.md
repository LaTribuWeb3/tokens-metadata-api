# Token Metadata API

A Node.js Express API for fetching token metadata from Ethereum networks. Built from OpenAPI specification.

## Features

- Query token metadata by network and address
- Support for multiple Ethereum networks (mainnet, arbitrum, polygon, etc.)
- File-based caching for improved performance
- RESTful API following OpenAPI 3.0 specification
- TypeScript support
- Docker support

## Supported Networks

- Mainnet
- Arbitrum
- Polygon
- Optimism
- Base
- Sepolia (testnet)
- Arbitrum Sepolia (testnet)
- Polygon Mumbai (testnet)

## API Endpoints

### GET /tokens/{network}/{address}

Retrieve token metadata for a given token address on a specific Ethereum network.

**Parameters:**
- `network` (string): Ethereum network name (e.g., "arbitrum", "mainnet")
- `address` (string): Token contract address (e.g., "0xaf88d065e77c8cc2239327c5edb3a432268e5831")

**Response:**
```json
{
  "address": "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  "network": "arbitrum",
  "name": "USD Coin",
  "symbol": "USDC",
  "decimals": 6,
  "cached": false,
  "timestamp": "2024-01-15T10:30:00Z"
}
```

**Example:**
```bash
curl https://your-api-domain.com/tokens/arbitrum/0xaf88d065e77c8cc2239327c5edb3a432268e5831
```

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Production

```bash
npm start
```

### Testing

```bash
npm test
```

### Docker

```bash
# Build image
docker build -t tokens-metadata-api .

# Run container
docker run -p 3000:3000 tokens-metadata-api
```

## Configuration

The API uses public RPC endpoints by default. For production use, consider configuring your own RPC endpoints in `src/services/ethereum.ts`.

## Caching

Token metadata is cached to a local file (`cache.json`) for 24 hours to improve performance and reduce RPC calls.

## Error Handling

The API returns appropriate HTTP status codes and error messages for:
- Invalid network names (400)
- Invalid address formats (400)
- Token not found (404)
- Internal server errors (500)

## Project Structure

1. Main Express server is defined in `src/index.ts`.
2. Token routes are in `src/routes/tokens.ts`.
3. Token controllers are in `src/controllers/tokens.ts`.
4. Ethereum service is in `src/services/ethereum.ts`.
5. Caching service is in `src/services/cache.ts`.
6. TypeScript types are in `src/types.ts`.
7. Integration tests are located in the `tests/` directory.

## OpenAPI Documentation

The API automatically generates OpenAPI 3.0 documentation. You can view it at the root endpoint (`/`) when running the application.

## Quick Start

1. Install the project dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Test the API:
   ```bash
   curl http://localhost:3000/health
   curl http://localhost:3000/tokens/arbitrum/0xaf88d065e77c8cc2239327c5edb3a432268e5831
   ```

## Environment Variables

Create a `.env` file based on `env.example`:

```bash
PORT=3000
NODE_ENV=development
```