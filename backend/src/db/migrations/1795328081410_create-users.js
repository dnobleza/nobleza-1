// Migration: create the users table.
// CommonJS style (exports.up / exports.down), same as the rest of the backend.

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    name: { type: 'text', notNull: true },
    email: { type: 'text', notNull: true },
    mobile_number: { type: 'text', notNull: true },
    password_hash: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // Unique on lower(email): "Juan@x.com" and "juan@x.com" clash even if the app forgets to lowercase.
  pgm.sql('CREATE UNIQUE INDEX users_email_unique ON users (lower(email))');

  // Named constraint, so a 23505 error tells us which rule was broken.
  pgm.addConstraint('users', 'users_mobile_number_unique', { unique: 'mobile_number' });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
};
