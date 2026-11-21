// Load variables from the .env file into process.env
require('dotenv').config();

// If there is no database address, stop right away with a clear message
if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is missing. Copy backend/.env.example to backend/.env and set it.'
  );
}

module.exports = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  DATABASE_URL: process.env.DATABASE_URL,
};
