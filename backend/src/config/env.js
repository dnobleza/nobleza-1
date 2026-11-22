// Load variables from the .env file into process.env
require('dotenv').config();

// If there is no database address, stop right away with a clear message
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is missing. Copy backend/.env.example to backend/.env and set it.'
  );
}

// Same for the secret that signs login tokens: without it, tokens can't be made safely.
if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is missing. Copy backend/.env.example to backend/.env and set it.'
  );
}

// In production the secret must be strong: at least 32 characters, and not the example value.
const JWT_SECRET_PLACEHOLDER = 'replace-me-with-a-long-random-string';
if (
  process.env.NODE_ENV === 'production' &&
  (process.env.JWT_SECRET.length < 32 || process.env.JWT_SECRET === JWT_SECRET_PLACEHOLDER)
) {
  throw new Error(
    'JWT_SECRET is too weak for production. Use a random value of at least 32 characters.'
  );
}

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  // How long a login token stays valid, e.g. "1h" or "15m".
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
};
