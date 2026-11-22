const { query } = require('../config/db');

// Columns we return. password_hash is never selected.
const SAFE_COLUMNS = 'id, name, email, mobile_number, created_at';

// Convert a database row (snake_case) into a plain object (camelCase).
function toUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    mobileNumber: row.mobile_number,
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

module.exports = { create, findByEmail, findByMobileNumber };
