const { PORT } = require('./config/env');
const logger = require('./utils/logger');
const healthRepository = require('./repositories/health.repository');
const app = require('./app');

async function start() {
  try {
    await healthRepository.ping();
    logger.info('Database connection OK');
  } catch (err) {
    logger.error(`Database connection failed: ${err.message}`);
    process.exit(1);
  }

  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });
}

start();
