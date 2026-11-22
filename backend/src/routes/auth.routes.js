const express = require('express');
const authValidation = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');

const router = express.Router();

router.post('/register', authValidation.validateRegister, authController.register);

module.exports = router;
