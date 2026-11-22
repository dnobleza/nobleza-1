const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

// Close the database connections after all tests, so Jest can exit cleanly.
afterAll(async () => {
  await pool.end();
});

describe('GET /health', () => {
  it('returns 200 and database up', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', database: 'up' });
  });
});
