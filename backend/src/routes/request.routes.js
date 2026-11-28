const express = require('express');
const requestValidation = require('../validations/request.validation');
const requestController = require('../controllers/request.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// Every route below needs a logged-in client. Runs before any validation.
router.use(requireAuth, requireRole('client'));

router.post('/', requestValidation.validateCreate, requestController.create);
router.get('/', requestValidation.validateListQuery, requestController.list);
router.get('/:id', requestValidation.validateRequestId, requestController.getOne);

module.exports = router;
