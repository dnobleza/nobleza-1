const { query } = require('../config/db');

// Columns we return. password_hash is never selected.
const SAFE_COLUMNS = 'id, name, email, mobile_number, role, created_at';

// Convert a database row (snake_case) into a plain object (camelCase).
function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    mobileNumber: row.mobile_number,
    role: row.role,
    createdAt: row.created_at,
  };
}

async function create({ name, email, mobileNumber, passwordHash }) {
  const result = await query(
    `INSERT INTO users (name, email, mobile_number, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING ${SAFE_COLUMNS}`,
    [name, email, mobileNumber, passwordHash]
  );
  return toUser(result.rows[0]);
}

async function findByEmail(email) {
  const result = await query(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE lower(email) = lower($1)`,
    [email]
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

async function findByMobileNumber(mobileNumber) {
  const result = await query(
    `SELECT ${SAFE_COLUMNS} FROM users WHERE mobile_number = $1`,
    [mobileNumber]
  );
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

async function findById(id) {
  const result = await query(`SELECT ${SAFE_COLUMNS} FROM users WHERE id = $1`, [id]);
  return result.rows[0] ? toUser(result.rows[0]) : null;
}

// Used for login only: this is the one query that also returns the password hash.
// The hash is kept apart from the user fields so it can't be sent to the client by accident.
async function findByEmailWithPassword(email) {
  const result = await query(
    `SELECT ${SAFE_COLUMNS}, password_hash FROM users WHERE lower(email) = lower($1)`,
    [email]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { user: toUser(row), passwordHash: row.password_hash };
}

// Same as findByEmailWithPassword, but looks the user up by mobile number (already normalized to +639XXXXXXXXX).
async function findByMobileNumberWithPassword(mobileNumber) {
  const result = await query(
    `SELECT ${SAFE_COLUMNS}, password_hash FROM users WHERE mobile_number = $1`,
    [mobileNumber]
  );
  const row = result.rows[0];
  if (!row) return null;
  return { user: toUser(row), passwordHash: row.password_hash };
}

module.exports = {
  create,
  findByEmail,
  findByMobileNumber,
  findById,
  findByEmailWithPassword,
  findByMobileNumberWithPassword,
};
