const express = require('express');
const requestLogger = require('./shared/middleware/requestLogger');
const healthRoutes = require('./modules/health/health.routes');

const app = express();

app.use(express.json());
app.use(requestLogger);

app.use('/health', healthRoutes);

module.exports = app;
