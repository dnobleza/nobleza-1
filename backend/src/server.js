const { PORT } = require('./config/env');
const logger = require('./shared/utils/logger');
const db = require('./db/client');
const app = require('./app');

async function start() {
  try {
    await db.query('SELECT 1');
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
