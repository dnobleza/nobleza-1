const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';

const EMAIL = 'juan@example.com';
const PASSWORD = 'secret123';
const MOBILE = '09171234567';
const INVALID = { error: 'Invalid credentials' };

// Empty the users table before every test, then create one user to log in with.
beforeEach(async () => {
  await pool.query('DELETE FROM users');
  await request(app).post(REGISTER_URL).send({
    name: 'Juan Dela Cruz',
    email: EMAIL,
    mobileNumber: MOBILE,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });
});

// Close the database connections after all tests, so Jest can exit cleanly.
afterAll(async () => {
  await pool.end();
});

function login(identifier, password = PASSWORD) {
  return request(app).post(LOGIN_URL).send({ identifier, password });
}

describe('POST /api/v1/auth/login - success', () => {
  it('returns 200 with a message, a token and the safe user fields only', async () => {
    const response = await login(EMAIL);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toEqual(expect.any(String));
    expect(response.body).not.toHaveProperty('result');
    expect(response.body.user.id).toEqual(expect.any(String));
    expect(response.body.user.name).toBe('Juan Dela Cruz');
    expect(response.body.user.email).toBe(EMAIL);
    expect(response.body.user.mobileNumber).toBe('+639171234567');
    expect(response.body.user.role).toBe('client');
    expect(response.body.user.createdAt).toEqual(expect.any(String));

    // Secrets must never come back.
    expect(response.body.user).not.toHaveProperty('password');
    expect(response.body.user).not.toHaveProperty('password_hash');
    expect(response.body.user).not.toHaveProperty('passwordHash');
  });

  it('accepts an uppercase email with extra spaces', async () => {
    const response = await login('  JUAN@Example.COM ');

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(EMAIL);
  });

  it.each([
    ['09XXXXXXXXX', '09171234567'],
    ['+639XXXXXXXXX', '+639171234567'],
    ['09 with spaces and dashes', '0917 123-4567'],
    ['+639 with spaces and dashes', '+63 917-123 4567'],
  ])('accepts a mobile number: %s', async (label, identifier) => {
    const response = await login(identifier);

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(EMAIL);
    expect(response.body.user.mobileNumber).toBe('+639171234567');
    expect(response.body.token).toEqual(expect.any(String));
  });

  it('returns a token that verifies with JWT_SECRET and whose sub is the user id', async () => {
    const response = await login(EMAIL);
    const payload = jwt.verify(response.body.token, process.env.JWT_SECRET, { algorithms: ['HS256'] });

    expect(response.status).toBe(200);
    expect(payload.sub).toBe(response.body.user.id);
  });
});

describe('POST /api/v1/auth/login - wrong credentials', () => {
  it('returns 401 "Invalid credentials" (not 400) for a password over 72 bytes', async () => {
    // 73 ASCII chars = 73 bytes. Same 401 as any wrong password, so the policy is not revealed.
    const response = await login(EMAIL, 'a'.repeat(73));

    expect(response.status).toBe(401);
    expect(response.body).toEqual(INVALID);
  });

  it('returns 401 for a password over 72 bytes made of multi-byte characters', async () => {
    // 37 x "é" = 37 characters but 74 bytes.
    const response = await login(EMAIL, 'é'.repeat(37));

    expect(response.status).toBe(401);
    expect(response.body).toEqual(INVALID);
  });

  it('does not let the first 72 bytes of a longer password log in', async () => {
    // Register a user whose password is exactly 72 bytes, then try it with extra bytes added.
    const exact = 'b'.repeat(72);
    await request(app).post(REGISTER_URL).send({
      name: 'Long Pass',
      email: 'long@example.com',
      mobileNumber: '09181234567',
      password: exact,
      confirmPassword: exact,
    });

    const ok = await login('long@example.com', exact);
    const tooLong = await login('long@example.com', exact + 'x');

    expect(ok.status).toBe(200);
    expect(tooLong.status).toBe(401);
    expect(tooLong.body).toEqual(INVALID);
  });
  it('returns 401 for a wrong password (email user)', async () => {
    const response = await login(EMAIL, 'wrong-password');

    expect(response.status).toBe(401);
    expect(response.body).toEqual(INVALID);
  });

  it('returns 401 for a wrong password (mobile user)', async () => {
    const response = await login(MOBILE, 'wrong-password');

    expect(response.status).toBe(401);
    expect(response.body).toEqual(INVALID);
  });

  it('returns 401 for an unknown email', async () => {
    const response = await login('nobody@example.com');

    expect(response.status).toBe(401);
    expect(response.body).toEqual(INVALID);
  });

  it('returns 401 for an unknown mobile number', async () => {
    const response = await login('09189999999');

    expect(response.status).toBe(401);
    expect(response.body).toEqual(INVALID);
  });

  it('gives the same response for wrong password, unknown email and unknown mobile', async () => {
    const wrongPassword = await login(EMAIL, 'wrong-password');
    const unknownEmail = await login('nobody@example.com');
    const unknownMobile = await login('09189999999');

    // Check the real values too, not only that they match (three 404s would also "match").
    expect(wrongPassword.status).toBe(401);
    expect(wrongPassword.body).toEqual(INVALID);
    expect(unknownEmail.status).toBe(wrongPassword.status);
    expect(unknownEmail.body).toEqual(wrongPassword.body);
    expect(unknownMobile.status).toBe(wrongPassword.status);
    expect(unknownMobile.body).toEqual(wrongPassword.body);
  });
});

describe('POST /api/v1/auth/login - validation', () => {
  it('returns 400 when identifier is missing', async () => {
    const response = await request(app).post(LOGIN_URL).send({ password: PASSWORD });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('identifier is required');
  });

  it('returns 400 when password is missing', async () => {
    const response = await request(app).post(LOGIN_URL).send({ identifier: EMAIL });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('password is required');
  });

  it.each([
    ['text without @', 'not-an-email'],
    ['too few digits', '12345'],
    ['wrong mobile prefix', '08171234567'],
    ['bad email (has @)', 'juan@'],
  ])('returns 400 when identifier is neither email nor mobile: %s', async (label, identifier) => {
    const response = await login(identifier);

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      'identifier must be a valid email or Philippine mobile number'
    );
  });

  it('returns 400 when the fields are not strings', async () => {
    const response = await request(app)
      .post(LOGIN_URL)
      .send({ identifier: 123, password: ['x'] });

    expect(response.status).toBe(400);
  });

  it('returns 400 when there is no body at all', async () => {
    const response = await request(app).post(LOGIN_URL);

    expect(response.status).toBe(400);
  });
});
