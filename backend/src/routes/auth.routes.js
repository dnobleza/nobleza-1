const express = require('express');
const authValidation = require('../validations/auth.validation');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', authValidation.validateRegister, authController.register);
router.post('/login', authValidation.validateLogin, authController.login);
router.get('/me', requireAuth, authController.me);

module.exports = router;
