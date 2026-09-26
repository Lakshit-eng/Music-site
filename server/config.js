// Central place that reads environment variables.
// Every other file should read config from here instead of using
// process.env directly, so all required values are validated in one spot.

require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
};

// Fail fast with a clear message instead of a confusing crash later.
if (!config.mongoUri) {
  console.error('Missing MONGODB_URI in your .env file. See .env.example.');
  process.exit(1);
}

if (!config.jwtSecret) {
  console.error('Missing JWT_SECRET in your .env file. See .env.example.');
  process.exit(1);
}

module.exports = config;
