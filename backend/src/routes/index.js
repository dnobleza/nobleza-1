const express = require('express');
const authRoutes = require('./auth.routes');
const requestRoutes = require('./request.routes');

// All feature endpoints live under /api/v1 (mounted in app.js).
const router = express.Router();

router.use('/auth', authRoutes);
router.use('/requests', requestRoutes);

module.exports = router;
