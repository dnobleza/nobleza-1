const PLACEHOLDER = 'replace-me-with-a-long-random-string';
const LONG_SECRET = 'x'.repeat(32);

const savedEnv = { ...process.env };

// Load src/config/env.js fresh, with the given NODE_ENV, JWT_SECRET and CORS_ORIGIN.
// An empty CORS_ORIGIN means "not set" (dotenv never overrides it from .env).
function loadEnv(nodeEnv, secret, corsOrigin = 'http://localhost:5173') {
  process.env.NODE_ENV = nodeEnv;
  process.env.JWT_SECRET = secret;
  process.env.CORS_ORIGIN = corsOrigin;
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

describe('config/env CORS_ORIGIN', () => {
  it('throws in production when CORS_ORIGIN is not set', () => {
    expect(() => loadEnv('production', LONG_SECRET, '')).toThrow(/CORS_ORIGIN/);
  });

  it('accepts CORS_ORIGIN in production and splits it into a list', () => {
    const config = loadEnv('production', LONG_SECRET, 'https://a.com, https://b.com');
    expect(config.CORS_ORIGIN).toEqual(['https://a.com', 'https://b.com']);
  });

  it('defaults to http://localhost:5173 outside production', () => {
    expect(loadEnv('development', 'short', '').CORS_ORIGIN).toEqual(['http://localhost:5173']);
  });
});
