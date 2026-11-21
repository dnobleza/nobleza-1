const { Pool } = require('pg');
const { DATABASE_URL } = require('../config/env');
const logger = require('../shared/utils/logger');

const pool = new Pool({ connectionString: DATABASE_URL });

// Idle connections can fail (e.g. database restarted). Log instead of crashing.
pool.on('error', (err) => {
  logger.error(`Database pool error: ${err.message}`);
});

function query(text, params) {
  return pool.query(text, params);
}

module.exports = { pool, query };
