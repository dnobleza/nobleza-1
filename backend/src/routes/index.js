const express = require('express');
const authRoutes = require('./auth.routes');

// All feature endpoints live under /api/v1 (mounted in app.js).
const router = express.Router();

router.use('/auth', authRoutes);

module.exports = router;
