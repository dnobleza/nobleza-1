const healthService = require('./health.service');

async function getHealth(req, res) {
  const result = await healthService.checkHealth();
  const statusCode = result.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(result);
}

module.exports = { getHealth };
