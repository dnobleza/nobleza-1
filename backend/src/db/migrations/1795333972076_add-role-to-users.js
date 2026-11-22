// Migration: add a role column to users.
// Every existing and new user starts as 'client'. Only 'client' and 'admin' are allowed.

exports.up = (pgm) => {
  pgm.addColumn('users', {
    role: { type: 'text', notNull: true, default: 'client' },
  });

  // Named constraint, so the name shows up in errors (Postgres error code 23514 = check violation).
  pgm.addConstraint('users', 'users_role_check', {
    check: "role IN ('client', 'admin')",
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('users', 'users_role_check');
  pgm.dropColumn('users', 'role');
};
