const adminRequestRepository = require('../repositories/adminRequest.repository');
const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');
const { withTransaction } = require('../config/db');
const { canAdminMove } = require('../utils/requestTransitions');

// Expects validated options: { statuses, search, sort, page, pageSize }.
async function listRequests(options) {
  const [items, total] = await Promise.all([
    adminRequestRepository.findPage(options),
    adminRequestRepository.count(options),
  ]);
  return { items, page: options.page, pageSize: options.pageSize, total };
}

// The full request with its history. Drafts are treated as not existing.
async function getRequest(requestId) {
  const request = await adminRequestRepository.findById(requestId);
  if (!request) {
    throw new NotFoundError('Request not found');
  }
  const history = await adminRequestRepository.findHistory(requestId);
  return { ...request, history };
}

// The status and its history row are saved together: both, or neither.
// adminId comes from the token, never from the request body.
async function changeStatus(adminId, requestId, { status, note }) {
  await withTransaction(async (db) => {
    // Lock first. A second change to the same request waits here until this one has finished.
    const current = await adminRequestRepository.lockById(requestId, db);
    if (!current) {
      throw new NotFoundError('Request not found');
    }
    // Checked against the LOCKED status, which nobody else can change now.
    if (!canAdminMove(current.status, status)) {
      throw new ConflictError(`Can't move a request from ${current.status} to ${status}`);
    }
    await adminRequestRepository.updateStatus(requestId, status, db);
    await adminRequestRepository.insertHistory(
      { requestId, fromStatus: current.status, toStatus: status, note, createdBy: adminId },
      db
    );
  });
  // Read after the transaction has been committed.
  return getRequest(requestId);
}

// adminNotes is text, or null to clear. Writes no history and does not change the status.
async function saveNotes(requestId, { adminNotes }) {
  const saved = await adminRequestRepository.updateNotes(requestId, adminNotes);
  if (!saved) {
    throw new NotFoundError('Request not found');
  }
  return getRequest(requestId);
}

module.exports = { listRequests, getRequest, changeStatus, saveNotes };
