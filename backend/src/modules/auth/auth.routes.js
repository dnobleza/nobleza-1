const express = require('express');
const authValidation = require('./auth.validation');
const authController = require('./auth.controller');

const router = express.Router();

router.post('/register', authValidation.validateRegister, authController.register);

module.exports = router;
