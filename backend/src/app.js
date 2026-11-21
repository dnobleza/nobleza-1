const express = require('express');
const healthRoutes = require('./modules/health/health.routes');

const app = express();

app.use(express.json());

app.use('/health', healthRoutes);

module.exports = app;
