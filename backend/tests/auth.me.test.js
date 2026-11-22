const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';
const ME_URL = '/api/v1/auth/me';

const EMAIL = 'juan@example.com';
const PASSWORD = 'secret123';

// setup-env.js loads backend/.env, so the same secret the app uses is available here.
const SECRET = process.env.JWT_SECRET;

let userId;
let token;

// Empty the users table, create one user and log in, so every test starts with a valid token.
beforeEach(async () => {
  await pool.query('DELETE FROM users');
  const registered = await request(app).post(REGISTER_URL).send({
    name: 'Juan Dela Cruz',
    email: EMAIL,
    mobileNumber: '09171234567',
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });
  userId = registered.body.user.id;
  const loggedIn = await request(app).post(LOGIN_URL).send({ identifier: EMAIL, password: PASSWORD });
  token = loggedIn.body.token;
});

// Close the database connections after all tests, so Jest can exit cleanly.
afterAll(async () => {
  await pool.end();
});

describe('GET /api/v1/auth/me - success', () => {
  it('returns 200 with the current user and no secrets', async () => {
    const response = await request(app).get(ME_URL).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe(userId);
    expect(response.body.user.name).toBe('Juan Dela Cruz');
    expect(response.body.user.email).toBe(EMAIL);
    expect(response.body.user.mobileNumber).toBe('+639171234567');
    expect(response.body.user.role).toBe('client');
    expect(response.body.user.createdAt).toEqual(expect.any(String));
    expect(response.body.user).not.toHaveProperty('password_hash');
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });
});

describe('GET /api/v1/auth/me - not authenticated', () => {
  it('returns 401 when there is no Authorization header', async () => {
    const response = await request(app).get(ME_URL);

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it('returns 401 for a malformed header (no Bearer prefix)', async () => {
    const response = await request(app).get(ME_URL).set('Authorization', token);

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it('returns 401 for a malformed header (wrong scheme)', async () => {
    const response = await request(app).get(ME_URL).set('Authorization', `Basic ${token}`);

    expect(response.status).toBe(401);
  });

  it('returns 401 for an invalid token (garbage)', async () => {
    const response = await request(app).get(ME_URL).set('Authorization', 'Bearer not-a-real-token');

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it('returns 401 for a token signed with the wrong secret', async () => {
    const forged = jwt.sign({ sub: userId }, 'some-other-secret', { expiresIn: '1h' });
    const response = await request(app).get(ME_URL).set('Authorization', `Bearer ${forged}`);

    expect(response.status).toBe(401);
  });

  it('returns 401 for an expired token', async () => {
    // Correct secret and correct user, but it expired an hour ago.
    // This is the only thing wrong with the token, so this test proves expiry is checked.
    const expired = jwt.sign({ sub: userId }, SECRET, { expiresIn: -3600 });
    const response = await request(app).get(ME_URL).set('Authorization', `Bearer ${expired}`);

    expect(response.status).toBe(401);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it.each(['bearer', 'BEARER', 'BeArEr'])('accepts the scheme in any letter case: %s', async (scheme) => {
    const response = await request(app).get(ME_URL).set('Authorization', `${scheme} ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.user.id).toBe(userId);
  });

  it('returns 401 "Invalid token" for a validly signed token without sub', async () => {
    const noSub = jwt.sign({ foo: 'bar' }, SECRET, { expiresIn: '1h' });
    const response = await request(app).get(ME_URL).set('Authorization', `Bearer ${noSub}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid token' });
  });

  it('gives different messages for an expired token and an invalid token', async () => {
    const expired = jwt.sign({ sub: userId }, SECRET, { expiresIn: -3600 });
    const expiredResponse = await request(app).get(ME_URL).set('Authorization', `Bearer ${expired}`);
    const invalidResponse = await request(app).get(ME_URL).set('Authorization', 'Bearer not-a-real-token');

    expect(expiredResponse.status).toBe(401);
    expect(expiredResponse.body).toEqual({ error: 'Token expired' });
    expect(invalidResponse.status).toBe(401);
    expect(invalidResponse.body).toEqual({ error: 'Invalid token' });
  });
});

describe('GET /api/v1/auth/me - user no longer exists', () => {
  it('returns 401 when the token is valid but the user was deleted', async () => {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);

    const response = await request(app).get(ME_URL).set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: 'Invalid token' });
  });
});
