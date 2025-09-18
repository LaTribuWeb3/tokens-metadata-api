# JWT Authentication

This API now requires JWT authentication for the `/tokens` endpoints.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp env.example .env
   ```
   Edit `.env` and set your `JWT_SECRET` to a secure random string.

## Generating a Test Token

To generate a dummy JWT token for testing:

```bash
npm run generate-token
```

This will output a JWT token that you can use for testing.

## Using the API

Include the JWT token in the `Authorization` header:

```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
     http://localhost:3000/tokens/mainnet/0xA0b86a33E6441c8C06DdDd2c4b8c8b8c8b8c8b8c8
```

## Token Structure

The JWT token contains the following payload:
```json
{
  "userId": "test-user-123",
  "email": "test@example.com", 
  "role": "user",
  "iat": 1234567890,
  "exp": 1234654290
}
```

## Error Responses

If authentication fails, you'll receive a 401 error:

```json
{
  "success": false,
  "errors": [
    {
      "code": 401,
      "message": "Authorization header is required"
    }
  ]
}
```

Common error messages:
- "Authorization header is required" - Missing Authorization header
- "Authorization header must start with 'Bearer '" - Invalid header format
- "Token is required" - Empty token
- "Token has expired" - Token is past its expiration time
- "Invalid token format" - Token is malformed or invalid

## Security Notes

- Change the `JWT_SECRET` in production to a secure random string
- Tokens expire after 24 hours by default
- The secret key should be at least 32 characters long
- Never commit the `.env` file with real secrets
