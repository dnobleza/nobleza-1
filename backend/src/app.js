const express = require('express');
const requestLogger = require('./shared/middleware/requestLogger');
const errorHandler = require('./shared/middleware/errorHandler');
const healthRoutes = require('./modules/health/health.routes');
const authRoutes = require('./modules/auth/auth.routes');

const app = express();

app.use(express.json());
app.use(requestLogger);

// Not versioned: used by CI and monitoring.
app.use('/health', healthRoutes);

// All feature endpoints live under /api/v1.
const v1Router = express.Router();
v1Router.use('/auth', authRoutes);
app.use('/api/v1', v1Router);

// Must be last, so it catches errors from everything above.
app.use(errorHandler);

module.exports = app;
