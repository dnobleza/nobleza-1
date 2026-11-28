const express = require('express');
const adminRequestValidation = require('../validations/adminRequest.validation');
const { validateRequestId } = require('../validations/request.validation');
const adminRequestController = require('../controllers/adminRequest.controller');
const { requireAuth, requireRole } = require('../middlewares/auth.middleware');

const router = express.Router();

// Every route below needs a logged-in admin. Runs before any validation.
router.use(requireAuth, requireRole('admin'));

router.get('/', adminRequestValidation.validateAdminListQuery, adminRequestController.list);
router.get('/:id', validateRequestId, adminRequestController.getOne);
router.patch(
  '/:id/status',
  validateRequestId,
  adminRequestValidation.validateStatusChange,
  adminRequestController.changeStatus
);
router.patch(
  '/:id/notes',
  validateRequestId,
  adminRequestValidation.validateNotes,
  adminRequestController.saveNotes
);

module.exports = router;
