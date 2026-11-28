const requestRepository = require('../repositories/request.repository');
const NotFoundError = require('../errors/NotFoundError');
const { withTransaction } = require('../config/db');

// "Active" = still moving. Drafts and finished requests are left out.
const ACTIVE_STATUSES = ['submitted', 'in_review', 'quoted', 'in_progress'];

// Saves the request and its first history row together: both are saved, or neither.
// Expects validated input. clientId comes from the token, never from the request body.
function createRequest(clientId, input) {
  const status = input.draft ? 'draft' : 'submitted';

  return withTransaction(async (db) => {
    const request = await requestRepository.create(
      {
        clientId,
        status,
        title: input.title,
        projectType: input.projectType,
        description: input.description,
        budgetRange: input.budgetRange,
        budgetPhp: input.budgetPhp,
        targetDeadline: input.targetDeadline,
        referenceLinks: input.referenceLinks,
        intakeAnswers: input.intakeAnswers,
      },
      db
    );
    await requestRepository.insertHistory(
      { requestId: request.id, fromStatus: null, toStatus: status, note: null, createdBy: clientId },
      db
    );
    return request;
  });
}

// Expects a validated limit (a whole number from 1 to 50).
function listRequests(clientId, { active, limit }) {
  const statuses = active ? ACTIVE_STATUSES : null;
  return requestRepository.findByClient({ clientId, statuses, limit });
}

// Returns the request with its history. Someone else's request gets the same 404 as a missing one.
async function getRequest(clientId, requestId) {
  const request = await requestRepository.findByIdForClient(requestId, clientId);
  if (!request) {
    throw new NotFoundError('Request not found');
  }
  const history = await requestRepository.findHistory(requestId);
  return { ...request, history };
}

module.exports = { createRequest, listRequests, getRequest };
