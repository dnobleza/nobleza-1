const { Pool } = require('pg');
const { DATABASE_URL } = require('./env');
const logger = require('../utils/logger');

const pool = new Pool({ connectionString: DATABASE_URL });

// Idle connections can fail (e.g. database restarted). Log instead of crashing.
pool.on('error', (err) => {
  logger.error(`Database pool error: ${err.message}`);
});

function query(text, params) {
  return pool.query(text, params);
}

// Runs work(client) as one transaction: either every query in it is saved, or none of them.
// All those queries must use the client passed in, because a transaction lives on one connection.
async function withTransaction(work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release(); // always give the connection back to the pool
  }
}

module.exports = { pool, query, withTransaction };
