module.exports = {
  setupFiles: ['./tests/setup-env.js'],
  // Run one test file at a time: all test files share the codehaus_test database,
  // and each one empties the users table, so running in parallel makes them wipe each other's rows.
  maxWorkers: 1,
};
