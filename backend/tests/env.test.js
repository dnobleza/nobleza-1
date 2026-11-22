const PLACEHOLDER = 'replace-me-with-a-long-random-string';
const LONG_SECRET = 'x'.repeat(32);

const savedEnv = { ...process.env };

// Load src/config/env.js fresh, with the given NODE_ENV and JWT_SECRET.
function loadEnv(nodeEnv, secret) {
  process.env.NODE_ENV = nodeEnv;
  process.env.JWT_SECRET = secret;
  let config;
  jest.isolateModules(() => {
    config = require('../src/config/env');
  });
  return config;
}

// Put the environment back so other tests in this process are not affected.
afterEach(() => {
  process.env = { ...savedEnv };
});

describe('config/env JWT_SECRET in production', () => {
  it('throws when the secret is shorter than 32 characters', () => {
    expect(() => loadEnv('production', 'x'.repeat(31))).toThrow(/JWT_SECRET/);
  });

  it('throws when the secret is the .env.example placeholder', () => {
    expect(() => loadEnv('production', PLACEHOLDER)).toThrow(/JWT_SECRET/);
  });

  it('accepts a secret of 32 characters or more', () => {
    expect(loadEnv('production', LONG_SECRET).JWT_SECRET).toBe(LONG_SECRET);
  });
});

describe('config/env JWT_SECRET outside production', () => {
  it('accepts a short secret in development', () => {
    expect(loadEnv('development', 'short').JWT_SECRET).toBe('short');
  });

  it('accepts a short secret in test', () => {
    expect(loadEnv('test', 'short').JWT_SECRET).toBe('short');
  });
});
