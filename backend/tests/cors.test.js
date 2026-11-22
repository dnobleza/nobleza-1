const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const ALLOWED_ORIGIN = 'http://localhost:5173';
const UNKNOWN_ORIGIN = 'http://evil.example';

// Close the database connections after all tests, so Jest can exit cleanly.
afterAll(async () => {
  await pool.end();
});

describe('CORS', () => {
  it('adds Access-Control-Allow-Origin for an allowed origin', async () => {
    const response = await request(app).get('/health').set('Origin', ALLOWED_ORIGIN);

    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
  });

  it('answers a preflight OPTIONS request with the allowed methods and headers', async () => {
    const response = await request(app)
      .options('/api/v1/auth/login')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Authorization, Content-Type');

    expect(response.status).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);

    const methods = response.headers['access-control-allow-methods'].split(',');
    expect(methods).toEqual(
      expect.arrayContaining(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])
    );

    const headers = response.headers['access-control-allow-headers'].toLowerCase();
    expect(headers).toContain('authorization');
    expect(headers).toContain('content-type');
  });

  it('does NOT add Access-Control-Allow-Origin for an unknown origin', async () => {
    const response = await request(app).get('/health').set('Origin', UNKNOWN_ORIGIN);

    expect(response.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('keeps the header on a failed login (401), so the frontend can read the error', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .set('Origin', ALLOWED_ORIGIN)
      .send({ identifier: 'nobody@example.com', password: 'wrong-password' });

    expect(response.status).toBe(401);
    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
  });
});
