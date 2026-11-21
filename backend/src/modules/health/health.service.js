const db = require('../../db/client');

async function checkHealth() {
  try {
    await db.query('SELECT 1');
    return { status: 'ok', database: 'up' };
  } catch (err) {
    return { status: 'error', database: 'down' };
  }
}

module.exports = { checkHealth };
