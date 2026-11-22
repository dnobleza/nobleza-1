const { query } = require('../config/db');

// Throws if the database cannot be reached.
async function ping() {
  await query('SELECT 1');
}

module.exports = { ping };
