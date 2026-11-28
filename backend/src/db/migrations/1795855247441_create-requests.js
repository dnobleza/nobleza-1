// Migration: create the requests table and its status history.
// If a list of allowed values changes later, that needs a NEW migration, not an edit to this one.

const PROJECT_TYPES = [
  'website',
  'web_app',
  'mobile_app',
  'automation',
  'ui_ux',
  'maintenance',
  'api',
  'other',
  'not_sure',
];
const BUDGET_RANGES = ['under_50k', '50k_100k', '100k_250k', 'above_250k', 'not_sure'];
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

// Builds SQL like:  status IN ('draft', 'submitted')
// Safe only because the values are the fixed lists above, never user input.
function isOneOf(column, values) {
  const list = values.map((value) => `'${value}'`).join(', ');
  return `${column} IN (${list})`;
}

exports.up = (pgm) => {
  pgm.createTable('requests', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    // Deleting a user also deletes that user's requests.
    client_id: { type: 'uuid', notNull: true, references: 'users', onDelete: 'CASCADE' },
    title: { type: 'text', notNull: true },
    project_type: { type: 'text', notNull: true },
    description: { type: 'text', notNull: true },
    budget_range: { type: 'text', notNull: true },
    budget_php: { type: 'integer' },
    target_deadline: { type: 'date' },
    reference_links: { type: 'text[]', notNull: true, default: pgm.func("'{}'::text[]") },
    intake_answers: { type: 'jsonb', notNull: true, default: pgm.func("'{}'::jsonb") },
    status: { type: 'text', notNull: true, default: 'submitted' },
    // Private to admins. Client queries must never select it.
    admin_notes: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('requests', 'requests_project_type_check', {
    check: isOneOf('project_type', PROJECT_TYPES),
  });
  pgm.addConstraint('requests', 'requests_budget_range_check', {
    check: isOneOf('budget_range', BUDGET_RANGES),
  });
  pgm.addConstraint('requests', 'requests_status_check', {
    check: isOneOf('status', STATUSES),
  });

  // For "this client's requests, newest first" and for the admin list filtered by status.
  pgm.createIndex('requests', ['client_id', { name: 'updated_at', sort: 'DESC' }]);
  pgm.createIndex('requests', ['status', 'updated_at']);

  pgm.createTable('request_status_history', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    request_id: { type: 'uuid', notNull: true, references: 'requests', onDelete: 'CASCADE' },
    from_status: { type: 'text' }, // null for the first row (creation)
    to_status: { type: 'text', notNull: true },
    note: { type: 'text' }, // visible to the client
    // No onDelete: a user who changed someone else's request cannot be deleted, so history keeps its author.
    // deferred = checked at COMMIT, after all cascades ran. Without it, "DELETE FROM users" fails even
    // when the history rows are being removed by the same statement.
    created_by: {
      type: 'uuid',
      notNull: true,
      references: 'users',
      deferrable: true,
      deferred: true,
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.createIndex('request_status_history', ['request_id', 'created_at']);
};

exports.down = (pgm) => {
  // History first, because it points at requests.
  pgm.dropTable('request_status_history');
  pgm.dropTable('requests');
};
