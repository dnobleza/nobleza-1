// Checks that every allowed project type and budget range is accepted, and unknown ones are rejected.
const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const REQUESTS_URL = '/api/v1/requests';

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

const PASSWORD = 'secret123';
let token;

// One client is enough: we only change the values in the body.
beforeAll(async () => {
  await pool.query('DELETE FROM users');
  await request(app).post('/api/v1/auth/register').send({
    name: 'Client',
    email: 'enums@example.com',
    mobileNumber: '09171234567',
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });
  const loggedIn = await request(app)
    .post('/api/v1/auth/login')
    .send({ identifier: 'enums@example.com', password: PASSWORD });
  token = loggedIn.body.token;
});

afterAll(async () => {
  await pool.end();
});

function post(overrides) {
  return request(app)
    .post(REQUESTS_URL)
    .set('Authorization', `Bearer ${token}`)
    .send({
      title: 'Company website',
      projectType: 'website',
      description: 'A five page website for our company.',
      budgetRange: '50k_100k',
      ...overrides,
    });
}

describe('POST /api/v1/requests - allowed values', () => {
  it.each(PROJECT_TYPES)('accepts projectType %s', async (projectType) => {
    const response = await post({ projectType });

    expect(response.status).toBe(201);
    expect(response.body.request.projectType).toBe(projectType);
  });

  it.each(BUDGET_RANGES)('accepts budgetRange %s', async (budgetRange) => {
    const response = await post({ budgetRange });

    expect(response.status).toBe(201);
    expect(response.body.request.budgetRange).toBe(budgetRange);
  });

  it.each([
    ['projectType', 'game'],
    ['budgetRange', 'below_50k'],
  ])('rejects an unknown %s', async (field, value) => {
    const response = await post({ [field]: value });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: expect.any(String) });
  });
});
