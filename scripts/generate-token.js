const jwt = require('jsonwebtoken');

// Use the same secret as in the middleware
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

// Create a dummy payload
const payload = {
  userId: 'test-user-123',
  email: 'test@example.com',
  role: 'user'
};

// Generate the token
const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

console.log('Generated JWT Token:');
console.log(token);
console.log('\nToken Details:');
console.log('Payload:', JSON.stringify(payload, null, 2));
console.log('Expires in: 24 hours');
console.log('\nUsage:');
console.log('Add this header to your requests:');
console.log(`Authorization: Bearer ${token}`);
