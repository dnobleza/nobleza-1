// Test-only: hide info logs and the dotenv banner so test output stays readable (warn/error still show).
process.env.LOG_LEVEL = 'warn';
process.env.DOTENV_CONFIG_QUIET = 'true';
