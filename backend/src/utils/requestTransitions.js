// The admin workflow for requests. To change which moves are allowed, edit the table below.

// Every status a request can have. Must match the CHECK constraint in the create-requests migration.
const STATUSES = [
  'draft',
  'submitted',
  'in_review',
  'quoted',
  'in_progress',
  'completed',
  'cancelled',
  'declined',
];

// Where an admin may move a request FROM each status. A status not listed here is final for admins.
const ADMIN_TRANSITIONS = {
  submitted: ['in_review', 'declined'],
  in_review: ['quoted', 'declined'],
  quoted: ['in_progress', 'declined'],
  in_progress: ['completed'],
};

// The statuses an admin may move to from "from". An empty list when there are none.
function adminNextStatuses(from) {
  return ADMIN_TRANSITIONS[from] ?? [];
}

// True only for a move listed in the table. Staying in the same status is never listed.
function canAdminMove(from, to) {
  return adminNextStatuses(from).includes(to);
}

module.exports = { STATUSES, ADMIN_TRANSITIONS, adminNextStatuses, canAdminMove };
