# Token Metadata API

A Cloudflare Workers API for fetching token metadata from Ethereum networks. Built with Hono, Chanfana, and ethers.js.

## Features

- Query token metadata by network and address
- Support for multiple Ethereum networks (mainnet, arbitrum, polygon, etc.)
- In-memory caching for improved performance
- OpenAPI/Swagger documentation
- TypeScript support

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
- npm or pnpm
- Cloudflare account (for deployment)

### Installation

```bash
npm install
```

### Local Development

```bash
npm run dev
```

### Testing

```bash
npm test
```

### Deployment

```bash
npm run deploy
```

## Configuration

The API uses public RPC endpoints by default. For production use, consider configuring your own RPC endpoints in `src/services/ethereum.ts`.

## Caching

Token metadata is cached in memory for 24 hours to improve performance and reduce RPC calls.

## Error Handling

The API returns appropriate HTTP status codes and error messages for:
- Invalid network names (400)
- Invalid address formats (400)
- Token not found (404)
- Internal server errors (500)

## Project Structure

1. Your main router is defined in `src/index.ts`.
2. Token endpoints are in `src/endpoints/tokens/`.
3. Ethereum service is in `src/services/ethereum.ts`.
4. Caching service is in `src/services/cache.ts`.
5. Integration tests are located in the `tests/` directory.

## OpenAPI Documentation

The API automatically generates OpenAPI 3.0 documentation. You can view it at the root endpoint (`/`) when running the application.

## Setup Steps

1. Install the project dependencies:
   ```bash
   npm install
   ```

2. Create a D1 database (if using the tasks endpoints):
   ```bash
   npx wrangler d1 create tokens-metadata-api-db
   ```
   ...and update the `database_id` field in `wrangler.json` with the new database ID.

3. Run database migrations (if using the tasks endpoints):
   ```bash
   npx wrangler d1 migrations apply DB --remote
   ```

4. Deploy the project:
   ```bash
   npm run deploy
   ```

5. Monitor your worker:
   ```bash
   npx wrangler tail
   ```