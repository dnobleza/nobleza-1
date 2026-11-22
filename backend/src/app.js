const express = require('express');
const requestLogger = require('./middlewares/requestLogger.middleware');
const errorHandler = require('./middlewares/error.middleware');
const healthRoutes = require('./routes/health.routes');
const v1Routes = require('./routes/index');

const app = express();

app.use(express.json());
app.use(requestLogger);

// Not versioned: used by CI and monitoring.
app.use('/health', healthRoutes);

// All feature endpoints live under /api/v1.
app.use('/api/v1', v1Routes);

// Must be last, so it catches errors from everything above.
app.use(errorHandler);

module.exports = app;
