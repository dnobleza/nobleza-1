const requestService = require('../services/request.service');

// The client id always comes from the token (req.user.id), never from the request body.
async function create(req, res) {
  const request = await requestService.createRequest(req.user.id, req.body);
  res.status(201).json({ request });
}

// res.locals.listOptions was set by validateListQuery.
async function list(req, res) {
  const requests = await requestService.listRequests(req.user.id, res.locals.listOptions);
  res.status(200).json({ requests });
}

async function getOne(req, res) {
  const request = await requestService.getRequest(req.user.id, req.params.id);
  res.status(200).json({ request });
}

module.exports = { create, list, getOne };
