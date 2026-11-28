// SQL for the admin side of requests. This is the only repository that reads or writes admin_notes.
const { pool } = require('../config/db');
const { DETAIL_COLUMNS, LAST_STEP, toDetail } = require('./request.repository');

// Sort names are mapped to FIXED text here, so user text never reaches ORDER BY.
// id is the tie-breaker: without it, rows with the same updated_at could repeat or be skipped
// from one page to the next.
const SORT_ORDERS = {
  newest: 'r.updated_at DESC, r.id DESC',
  oldest: 'r.updated_at ASC, r.id ASC',
};

// Used by both the list and the count, so they always agree.
// $1 = list of statuses or null, $2 = ILIKE pattern or null. Drafts are never included.
const LIST_FROM = `
  FROM requests r
  JOIN users u ON u.id = r.client_id
  WHERE r.status <> 'draft'
    AND ($1::text[] IS NULL OR r.status = ANY($1::text[]))
    AND ($2::text IS NULL OR r.title ILIKE $2 OR u.name ILIKE $2)`;

// In ILIKE, % means "anything" and _ means "any one character". A \ in front makes them,
// and \ itself, ordinary characters.
function toLikePattern(search) {
  if (search === null) return null;
  return `%${search.replace(/[\\%_]/g, '\\$&')}%`;
}

function toListItem(row) {
  return {
    id: row.id,
    title: row.title,
    projectType: row.project_type,
    budgetRange: row.budget_range,
    budgetPhp: row.budget_php,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    client: { id: row.client_id, name: row.client_name, email: row.client_email },
  };
}

function toHistoryEntry(row) {
  return {
    id: row.id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    note: row.note,
    createdAt: row.created_at,
    createdBy: { id: row.author_id, name: row.author_name },
  };
}

// One page of requests. statuses and search may be null, meaning "no filter".
async function findPage({ statuses, search, sort, page, pageSize }) {
  if (!Object.hasOwn(SORT_ORDERS, sort)) {
    throw new Error(`Unknown sort: ${sort}`);
  }
  const result = await pool.query(
    `SELECT r.id, r.title, r.project_type, r.budget_range, r.budget_php, r.status,
            r.created_at, r.updated_at,
            u.id AS client_id, u.name AS client_name, u.email AS client_email
     ${LIST_FROM}
     ORDER BY ${SORT_ORDERS[sort]}
     LIMIT $3 OFFSET $4`,
    [statuses, toLikePattern(search), pageSize, (page - 1) * pageSize]
  );
  return result.rows.map(toListItem);
}

// How many requests match the filters, on all pages together.
async function count({ statuses, search }) {
  const result = await pool.query(`SELECT count(*)::int AS total ${LIST_FROM}`, [
    statuses,
    toLikePattern(search),
  ]);
  return result.rows[0].total;
}

// One request with admin notes and the client's contact details. null if missing or a draft.
async function findById(id) {
  const result = await pool.query(
    `SELECT ${DETAIL_COLUMNS}, ${LAST_STEP}, r.admin_notes,
            u.id AS client_id, u.name AS client_name, u.email AS client_email,
            u.mobile_number AS client_mobile_number
     FROM requests r
     JOIN users u ON u.id = r.client_id
     WHERE r.id = $1 AND r.status <> 'draft'`,
    [id]
  );
  const row = result.rows[0];
  if (!row) return null;
  return {
    ...toDetail(row),
    lastStep: row.last_step,
    adminNotes: row.admin_notes,
    client: {
      id: row.client_id,
      name: row.client_name,
      email: row.client_email,
      mobileNumber: row.client_mobile_number,
    },
  };
}

// Oldest first, with who made each change.
async function findHistory(requestId) {
  const result = await pool.query(
    `SELECT h.id, h.from_status, h.to_status, h.note, h.created_at,
            u.id AS author_id, u.name AS author_name
     FROM request_status_history h
     JOIN users u ON u.id = h.created_by
     WHERE h.request_id = $1
     ORDER BY h.created_at, h.id`,
    [requestId]
  );
  return result.rows.map(toHistoryEntry);
}

// Locks the row until the transaction ends. Anyone else asking for the same lock has to wait.
// "db" must be the client of a transaction.
async function lockById(id, db) {
  const result = await db.query(
    `SELECT id, status FROM requests
     WHERE id = $1 AND status <> 'draft'
     FOR UPDATE`,
    [id]
  );
  return result.rows[0] ?? null;
}

// clock_timestamp() is the time right now. now() would be the time the transaction STARTED,
// which is wrong for a transaction that had to wait for the lock.
async function updateStatus(id, status, db) {
  await db.query('UPDATE requests SET status = $2, updated_at = clock_timestamp() WHERE id = $1', [
    id,
    status,
  ]);
}

async function insertHistory({ requestId, fromStatus, toStatus, note, createdBy }, db) {
  await db.query(
    `INSERT INTO request_status_history
       (request_id, from_status, to_status, note, created_by, created_at)
     VALUES ($1, $2, $3, $4, $5, clock_timestamp())`,
    [requestId, fromStatus, toStatus, note, createdBy]
  );
}

// Leaves updated_at alone: private notes are not a change the client can see.
// Returns false if the request is missing or a draft.
async function updateNotes(id, adminNotes) {
  const result = await pool.query(
    `UPDATE requests SET admin_notes = $2
     WHERE id = $1 AND status <> 'draft'`,
    [id, adminNotes]
  );
  return result.rowCount === 1;
}

module.exports = {
  findPage,
  count,
  findById,
  findHistory,
  lockById,
  updateStatus,
  insertHistory,
  updateNotes,
};
