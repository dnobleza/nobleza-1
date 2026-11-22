const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/db/client');

const URL = '/api/v1/auth/register';

// A valid body. Each test copies it and changes only what it needs.
function validBody(overrides = {}) {
  return {
    name: 'Juan Dela Cruz',
    email: 'juan@example.com',
    mobileNumber: '09171234567',
    password: 'secret123',
    confirmPassword: 'secret123',
    ...overrides,
  };
}

// Empty the users table before every test, so tests don't depend on each other.
beforeEach(async () => {
  await pool.query('DELETE FROM users');
});

// Close the database connections after all tests, so Jest can exit cleanly.
afterAll(async () => {
  await pool.end();
});

describe('POST /api/v1/auth/register - success', () => {
  it('returns 201 with the safe user fields only', async () => {
    const response = await request(app).post(URL).send(validBody());

    expect(response.status).toBe(201);
    expect(response.body.id).toEqual(expect.any(String));
    expect(response.body.name).toBe('Juan Dela Cruz');
    expect(response.body.email).toBe('juan@example.com');
    expect(response.body.mobileNumber).toBe('+639171234567');
    expect(response.body.createdAt).toEqual(expect.any(String));

    // Secrets must never come back.
    expect(response.body).not.toHaveProperty('password');
    expect(response.body).not.toHaveProperty('password_hash');
    expect(response.body).not.toHaveProperty('passwordHash');
    expect(response.body).not.toHaveProperty('confirmPassword');
  });

  it('returns a 09XXXXXXXXX mobile number as +639XXXXXXXXX', async () => {
    const response = await request(app)
      .post(URL)
      .send(validBody({ mobileNumber: '09171234567' }));

    expect(response.status).toBe(201);
    expect(response.body.mobileNumber).toBe('+639171234567');
  });

  it('accepts +639XXXXXXXXX with spaces or dashes', async () => {
    const response = await request(app)
      .post(URL)
      .send(validBody({ mobileNumber: '+63 917-123-4567' }));

    expect(response.status).toBe(201);
    expect(response.body.mobileNumber).toBe('+639171234567');
  });

  it('trims the name and stores the email in lowercase', async () => {
    const response = await request(app)
      .post(URL)
      .send(validBody({ name: '  Juan  ', email: '  Juan@Example.COM ' }));

    expect(response.status).toBe(201);
    expect(response.body.name).toBe('Juan');
    expect(response.body.email).toBe('juan@example.com');
  });

  it('stores a hashed password, not the plain one', async () => {
    await request(app).post(URL).send(validBody({ password: 'secret123', confirmPassword: 'secret123' }));

    const result = await pool.query('SELECT password_hash FROM users');

    expect(result.rows).toHaveLength(1);
    expect(result.rows[0].password_hash).toEqual(expect.any(String));
    expect(result.rows[0].password_hash).not.toBe('secret123');
    // bcrypt hashes start with $2a$, $2b$ or $2y$
    expect(result.rows[0].password_hash).toMatch(/^\$2[aby]\$/);
  });
});

describe('POST /api/v1/auth/register - duplicates (409)', () => {
  it('rejects a duplicate email', async () => {
    await request(app).post(URL).send(validBody());

    const response = await request(app)
      .post(URL)
      .send(validBody({ mobileNumber: '09181234567' }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Email already registered' });
  });

  it('rejects the same email in different letter case', async () => {
    await request(app).post(URL).send(validBody());

    const response = await request(app)
      .post(URL)
      .send(validBody({ email: 'JUAN@Example.com', mobileNumber: '09181234567' }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Email already registered' });
  });

  it('rejects a duplicate mobile number', async () => {
    await request(app).post(URL).send(validBody());

    const response = await request(app)
      .post(URL)
      .send(validBody({ email: 'maria@example.com' }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Mobile number already registered' });
  });

  it('rejects a duplicate mobile number entered in the other format', async () => {
    await request(app).post(URL).send(validBody({ mobileNumber: '09171234567' }));

    const response = await request(app)
      .post(URL)
      .send(validBody({ email: 'maria@example.com', mobileNumber: '+639171234567' }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Mobile number already registered' });
  });

  it('rejects a lowercase email when the DB already has a mixed-case one (lower(email) index)', async () => {
    // Insert directly in the DB, bypassing the app, with a mixed-case email.
    await pool.query(
      `INSERT INTO users (name, email, mobile_number, password_hash)
       VALUES ($1, $2, $3, $4)`,
      ['Direct Insert', 'Juan@Example.com', '+639191234567', 'not-a-real-hash']
    );

    const response = await request(app).post(URL).send(validBody({ email: 'juan@example.com' }));

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: 'Email already registered' });
  });
});

describe('POST /api/v1/auth/register - validation (400)', () => {
  // Every 400 must have an error message that names the wrong field.
  async function expectBadRequest(body, field) {
    const response = await request(app).post(URL).send(body);

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
    expect(response.body.error).toContain(field);
  }

  it('rejects a missing name', async () => {
    const body = validBody();
    delete body.name;
    await expectBadRequest(body, 'name');
  });

  it('rejects a blank name', async () => {
    await expectBadRequest(validBody({ name: '   ' }), 'name');
  });

  it('rejects a name longer than 100 characters', async () => {
    await expectBadRequest(validBody({ name: 'a'.repeat(101) }), 'name');
  });

  it('rejects an invalid email', async () => {
    await expectBadRequest(validBody({ email: 'not-an-email' }), 'email');
  });

  it('rejects a missing email', async () => {
    const body = validBody();
    delete body.email;
    await expectBadRequest(body, 'email');
  });

  it('rejects an invalid mobile number', async () => {
    await expectBadRequest(validBody({ mobileNumber: '12345' }), 'mobileNumber');
  });

  it('rejects a mobile number that is not a Philippine mobile (wrong prefix)', async () => {
    await expectBadRequest(validBody({ mobileNumber: '08171234567' }), 'mobileNumber');
  });

  it('rejects a missing mobile number', async () => {
    const body = validBody();
    delete body.mobileNumber;
    await expectBadRequest(body, 'mobileNumber');
  });

  it('rejects a password shorter than 8 characters', async () => {
    await expectBadRequest(validBody({ password: 'short', confirmPassword: 'short' }), 'password');
  });

  it('rejects a password longer than 72 characters', async () => {
    const long = 'a'.repeat(73);
    await expectBadRequest(validBody({ password: long, confirmPassword: long }), 'password');
  });

  it('rejects a missing password', async () => {
    const body = validBody();
    delete body.password;
    await expectBadRequest(body, 'password');
  });

  it('rejects a confirmPassword that does not match', async () => {
    await expectBadRequest(validBody({ confirmPassword: 'different123' }), 'confirmPassword');
  });

  it('rejects a missing confirmPassword', async () => {
    const body = validBody();
    delete body.confirmPassword;
    await expectBadRequest(body, 'confirmPassword');
  });

  it('rejects an empty body', async () => {
    const response = await request(app).post(URL).send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toEqual(expect.any(String));
  });

  it('does not create a user when validation fails', async () => {
    await request(app).post(URL).send(validBody({ email: 'bad' }));

    const result = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    expect(result.rows[0].count).toBe(0);
  });
});

describe('POST /api/v1/auth/register - extra limits and errors', () => {
  it('rejects a password longer than 72 bytes even when it has fewer than 72 characters', async () => {
    // "é" is 2 bytes in UTF-8: 40 characters = 80 bytes. bcrypt would silently ignore the extra bytes.
    const multiByte = 'é'.repeat(40);
    const response = await request(app)
      .post(URL)
      .send(validBody({ password: multiByte, confirmPassword: multiByte }));

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('password');
    expect(response.body.error).toContain('72 bytes');
  });

  it('accepts a password of exactly 72 bytes', async () => {
    const exact = 'é'.repeat(36); // 36 x 2 bytes = 72 bytes
    const response = await request(app)
      .post(URL)
      .send(validBody({ password: exact, confirmPassword: exact }));

    expect(response.status).toBe(201);
  });

  it('rejects an email longer than 254 characters', async () => {
    const longEmail = 'a'.repeat(250) + '@example.com'; // 262 characters
    const response = await request(app).post(URL).send(validBody({ email: longEmail }));

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('email');
  });

  it('returns 400 when a field has the wrong type (name: 123)', async () => {
    const response = await request(app).post(URL).send(validBody({ name: 123 }));

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('name');
  });

  it('returns 400 "Invalid JSON body" for malformed JSON', async () => {
    const response = await request(app)
      .post(URL)
      .set('Content-Type', 'application/json')
      .send('{"name": "Juan",');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid JSON body' });
  });

  it('returns 413 "Request body too large" and does not log it as a server error', async () => {
    const logger = require('../src/shared/utils/logger');
    const errorSpy = jest.spyOn(logger, 'error').mockImplementation(() => {});

    const response = await request(app)
      .post(URL)
      .send(validBody({ name: 'a'.repeat(200 * 1024) })); // bigger than the 100kb default limit

    expect(response.status).toBe(413);
    expect(response.body).toEqual({ error: 'Request body too large' });
    expect(errorSpy).not.toHaveBeenCalled();

    errorSpy.mockRestore();
  });

  it('lets only one of two simultaneous registrations with the same email succeed', async () => {
    // Different mobile numbers, same email, sent at the same moment.
    // Both can pass the "friendly" check, so the database unique index must stop one of them.
    const [first, second] = await Promise.all([
      request(app).post(URL).send(validBody({ mobileNumber: '09171234567' })),
      request(app).post(URL).send(validBody({ mobileNumber: '09181234567' })),
    ]);

    expect([first.status, second.status].sort()).toEqual([201, 409]);
    const loser = first.status === 409 ? first : second;
    expect(loser.body).toEqual({ error: 'Email already registered' });

    const result = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    expect(result.rows[0].count).toBe(1);
  });
});
