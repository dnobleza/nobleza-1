const healthRepository = require('../repositories/health.repository');

async function checkHealth() {
  try {
    await healthRepository.ping();
    return { status: 'ok', database: 'up' };
  } catch (err) {
    return { status: 'error', database: 'down' };
  }
}

module.exports = { checkHealth };
