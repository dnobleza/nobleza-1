const { pool } = require('../config/db');

// What a client may see in a list. admin_notes is deliberately in NO list of columns in this file.
// target_deadline::text keeps the date as "YYYY-MM-DD"; as a Date object it could shift by a time zone.
const SUMMARY_COLUMNS = `r.id, r.title, r.project_type, r.budget_range, r.budget_php,
  r.target_deadline::text AS target_deadline, r.status, r.created_at, r.updated_at`;

// What a client may see for one request.
const DETAIL_COLUMNS = `${SUMMARY_COLUMNS}, r.description, r.reference_links, r.intake_answers`;

// The furthest stepper step this request ever reached (0 = none), worked out from its history.
// cancelled, declined and draft are not steps, so array_position gives NULL for them and max skips it.
const LAST_STEP = `COALESCE((
    SELECT max(array_position(
      ARRAY['submitted', 'in_review', 'quoted', 'in_progress', 'completed'], h.to_status))
    FROM request_status_history h
    WHERE h.request_id = r.id
  ), 0) AS last_step`;

// Convert a database row (snake_case) into a plain object (camelCase).
function toSummary(row) {
  return {
    id: row.id,
    title: row.title,
    projectType: row.project_type,
    budgetRange: row.budget_range,
    budgetPhp: row.budget_php,
    targetDeadline: row.target_deadline,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDetail(row) {
  return {
    ...toSummary(row),
    description: row.description,
    referenceLinks: row.reference_links,
    intakeAnswers: row.intake_answers,
  };
}

function toHistoryEntry(row) {
  return {
    id: row.id,
    fromStatus: row.from_status,
    toStatus: row.to_status,
    note: row.note,
    createdAt: row.created_at,
  };
}

// "db" is the pool by default, or the client of a transaction.
async function create(data, db = pool) {
  const result = await db.query(
    `INSERT INTO requests AS r
       (client_id, title, project_type, description, budget_range, budget_php,
        target_deadline, reference_links, intake_answers, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING ${DETAIL_COLUMNS}`,
    [
      data.clientId,
      data.title,
      data.projectType,
      data.description,
      data.budgetRange,
      data.budgetPhp,
      data.targetDeadline,
      data.referenceLinks,
      data.intakeAnswers,
      data.status,
    ]
  );
  return toDetail(result.rows[0]);
}

async function insertHistory({ requestId, fromStatus, toStatus, note, createdBy }, db = pool) {
  await db.query(
    `INSERT INTO request_status_history (request_id, from_status, to_status, note, created_by)
     VALUES ($1, $2, $3, $4, $5)`,
    [requestId, fromStatus, toStatus, note, createdBy]
  );
}

// One client's requests, newest update first. statuses = null means "all statuses".
async function findByClient({ clientId, statuses, limit }) {
  const result = await pool.query(
    `SELECT ${SUMMARY_COLUMNS}, ${LAST_STEP}
     FROM requests r
     WHERE r.client_id = $1
       AND ($2::text[] IS NULL OR r.status = ANY($2::text[]))
     ORDER BY r.updated_at DESC, r.id DESC
     LIMIT $3`,
    [clientId, statuses, limit]
  );
  return result.rows.map((row) => ({ ...toSummary(row), lastStep: row.last_step }));
}

// Ownership is checked in the SQL: someone else's request looks the same as a missing one (null).
async function findByIdForClient(id, clientId) {
  const result = await pool.query(
    `SELECT ${DETAIL_COLUMNS}, ${LAST_STEP}
     FROM requests r
     WHERE r.id = $1 AND r.client_id = $2`,
    [id, clientId]
  );
  const row = result.rows[0];
  return row ? { ...toDetail(row), lastStep: row.last_step } : null;
}

// Oldest first. Does not check ownership: call findByIdForClient first.
async function findHistory(requestId) {
  const result = await pool.query(
    `SELECT id, from_status, to_status, note, created_at
     FROM request_status_history
     WHERE request_id = $1
     ORDER BY created_at, id`,
    [requestId]
  );
  return result.rows.map(toHistoryEntry);
}

module.exports = { create, insertHistory, findByClient, findByIdForClient, findHistory };
