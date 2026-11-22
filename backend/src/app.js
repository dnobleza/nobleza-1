const express = require('express');
const cors = require('cors');
const config = require('./config/env');
const requestLogger = require('./middlewares/requestLogger.middleware');
const errorHandler = require('./middlewares/error.middleware');
const healthRoutes = require('./routes/health.routes');
const v1Routes = require('./routes/index');

const app = express();

// Must come before the routes, so browsers get the CORS headers (and preflight answers).
app.use(
  cors({
    origin: config.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Authorization', 'Content-Type'],
  })
);

app.use(express.json());
app.use(requestLogger);

// Not versioned: used by CI and monitoring.
app.use('/health', healthRoutes);

// All feature endpoints live under /api/v1.
app.use('/api/v1', v1Routes);

// Must be last, so it catches errors from everything above.
app.use(errorHandler);

module.exports = app;
