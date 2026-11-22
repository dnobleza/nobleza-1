// Test-only: hide info logs and the dotenv banner so test output stays readable (warn/error still show).
process.env.LOG_LEVEL = 'warn';
process.env.DOTENV_CONFIG_QUIET = 'true';

// Load backend/.env so TEST_DATABASE_URL is available (dotenv never overrides variables already set).
require('dotenv').config();

// Tests must use their own database, never the dev one.
const testUrl = process.env.TEST_DATABASE_URL;
if (!testUrl) {
  throw new Error(
    'TEST_DATABASE_URL is missing. Add it to backend/.env (see backend/.env.example).'
  );
}

// Safety guard: the tests delete rows, so the database name must end in _test.
const databaseName = new URL(testUrl).pathname.slice(1);
if (!databaseName.endsWith('_test')) {
  throw new Error(
    `Refusing to run tests: database "${databaseName}" does not end in _test. ` +
      'Tests delete data, so they only run against a test database.'
  );
}

// The app reads DATABASE_URL, so point it at the test database.
process.env.DATABASE_URL = testUrl;
