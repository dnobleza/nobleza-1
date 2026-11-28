const adminRequestService = require('../services/adminRequest.service');

// res.locals.listOptions was set by validateAdminListQuery.
async function list(req, res) {
  const result = await adminRequestService.listRequests(res.locals.listOptions);
  res.status(200).json(result);
}

async function getOne(req, res) {
  const request = await adminRequestService.getRequest(req.params.id);
  res.status(200).json({ request });
}

// The admin id always comes from the token (req.user.id), never from the request body.
async function changeStatus(req, res) {
  const request = await adminRequestService.changeStatus(req.user.id, req.params.id, req.body);
  res.status(200).json({ request });
}

async function saveNotes(req, res) {
  const request = await adminRequestService.saveNotes(req.params.id, req.body);
  res.status(200).json({ request });
}

module.exports = { list, getOne, changeStatus, saveNotes };
