const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';
const REQUESTS_URL = '/api/v1/requests';

const PASSWORD = 'secret123';
const MISSING_ID = '00000000-0000-0000-0000-000000000000';

// Each test starts with two clients and one admin, all logged in.
let clientA;
let clientB;
let admin;

// Registers a user, optionally makes them admin, then logs in.
// The role is changed BEFORE login, because the token carries the role.
async function createUser(name, email, mobileNumber, role = 'client') {
  const registered = await request(app).post(REGISTER_URL).send({
    name,
    email,
    mobileNumber,
    password: PASSWORD,
    confirmPassword: PASSWORD,
  });
  const { id } = registered.body.user;
  await pool.query('UPDATE users SET role = $1 WHERE id = $2', [role, id]);
  const loggedIn = await request(app).post(LOGIN_URL).send({ identifier: email, password: PASSWORD });
  return { id, token: loggedIn.body.token };
}

// Deleting users also deletes their requests and history (ON DELETE CASCADE).
beforeEach(async () => {
  await pool.query('DELETE FROM users');
  clientA = await createUser('Client A', 'a@example.com', '09171234567');
  clientB = await createUser('Client B', 'b@example.com', '09181234567');
  admin = await createUser('Admin', 'admin@example.com', '09191234567', 'admin');
});

afterAll(async () => {
  await pool.end();
});

// A valid body. Pass overrides to change one thing at a time.
function validBody(overrides = {}) {
  return {
    title: 'Company website',
    projectType: 'website',
    description: 'A five page website for our company.',
    budgetRange: '50k_100k',
    ...overrides,
  };
}

function post(user, body) {
  return request(app).post(REQUESTS_URL).set('Authorization', `Bearer ${user.token}`).send(body);
}

function get(user, path = '') {
  return request(app).get(`${REQUESTS_URL}${path}`).set('Authorization', `Bearer ${user.token}`);
}

// Creates a request through the API and returns it. Fails loudly if creating did not work.
async function createRequest(user, overrides = {}) {
  const response = await post(user, validBody(overrides));
  expect(response.status).toBe(201);
  return response.body.request;
}

// Moves a request to a new status directly in the database (no status endpoint exists yet).
async function moveTo(requestId, fromStatus, toStatus) {
  await pool.query('UPDATE requests SET status = $1 WHERE id = $2', [toStatus, requestId]);
  await pool.query(
    `INSERT INTO request_status_history (request_id, from_status, to_status, created_by, created_at)
     VALUES ($1, $2, $3, $4, clock_timestamp())`,
    [requestId, fromStatus, toStatus, admin.id]
  );
}

async function setUpdatedAt(requestId, timestamp) {
  await pool.query('UPDATE requests SET updated_at = $1 WHERE id = $2', [timestamp, requestId]);
}

async function historyRows(requestId) {
  const result = await pool.query(
    'SELECT * FROM request_status_history WHERE request_id = $1 ORDER BY created_at',
    [requestId]
  );
  return result.rows;
}

async function countRequests() {
  const result = await pool.query('SELECT count(*)::int AS total FROM requests');
  return result.rows[0].total;
}

// Today (or a day near it) in Manila, as YYYY-MM-DD. "en-CA" formats dates that way.
function manilaDate(offsetDays = 0) {
  const date = new Date(Date.now() + offsetDays * 24 * 60 * 60 * 1000);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Manila' }).format(date);
}

describe('POST /api/v1/requests - success', () => {
  it('returns 201 with a submitted request owned by the caller', async () => {
    const body = validBody({
      title: '  Company website  ',
      budgetPhp: 80000,
      targetDeadline: manilaDate(30),
      referenceLinks: ['https://example.com', 'http://example.org/page'],
      intakeAnswers: { pages: 5, hasBranding: true },
    });

    const response = await post(clientA, body);

    expect(response.status).toBe(201);
    expect(response.body.request).toMatchObject({
      id: expect.any(String),
      title: 'Company website',
      projectType: 'website',
      description: body.description,
      budgetRange: '50k_100k',
      budgetPhp: 80000,
      targetDeadline: body.targetDeadline,
      referenceLinks: body.referenceLinks,
      intakeAnswers: body.intakeAnswers,
      status: 'submitted',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    const saved = await pool.query('SELECT client_id FROM requests WHERE id = $1', [
      response.body.request.id,
    ]);
    expect(saved.rows[0].client_id).toBe(clientA.id);
  });

  it('writes exactly one history row (null to submitted) by the caller', async () => {
    const created = await createRequest(clientA);

    const rows = await historyRows(created.id);

    expect(rows).toHaveLength(1);
    expect(rows[0].from_status).toBeNull();
    expect(rows[0].to_status).toBe('submitted');
    expect(rows[0].created_by).toBe(clientA.id);
  });

  it('creates a draft with { draft: true }, with its history row', async () => {
    const created = await createRequest(clientA, { draft: true });

    const rows = await historyRows(created.id);

    expect(created.status).toBe('draft');
    expect(rows).toHaveLength(1);
    expect(rows[0].from_status).toBeNull();
    expect(rows[0].to_status).toBe('draft');
  });

  it('accepts today (Manila) as the target deadline', async () => {
    const created = await createRequest(clientA, { targetDeadline: manilaDate(0) });

    expect(created.targetDeadline).toBe(manilaDate(0));
  });

  it('accepts the shortest and longest allowed title and description', async () => {
    await createRequest(clientA, { title: 'abc', description: 'abcde' });
    await createRequest(clientA, { title: 'a'.repeat(120), description: 'a'.repeat(5000) });

    expect(await countRequests()).toBe(2);
  });
});

describe('POST /api/v1/requests - validation', () => {
  it.each([
    ['missing title', { title: undefined }],
    ['title of 2 characters', { title: 'ab' }],
    ['title of 121 characters', { title: 'a'.repeat(121) }],
    ['title that is only spaces', { title: '     ' }],
    ['title that is not a string', { title: 12345 }],
    ['missing description', { description: undefined }],
    ['description of 4 characters', { description: 'abcd' }],
    ['description of 5001 characters', { description: 'a'.repeat(5001) }],
    ['missing projectType', { projectType: undefined }],
    ['unknown projectType', { projectType: 'game' }],
    ['missing budgetRange', { budgetRange: undefined }],
    ['unknown budgetRange', { budgetRange: 'below_50k' }],
    ['negative budgetPhp', { budgetPhp: -1 }],
    ['decimal budgetPhp', { budgetPhp: 10.5 }],
    ['budgetPhp as a string', { budgetPhp: '80000' }],
    ['budgetPhp too large for the column', { budgetPhp: 3000000000 }],
    ['deadline in the past', { targetDeadline: manilaDate(-1) }],
    ['deadline that is not a real date', { targetDeadline: '2099-02-30' }],
    ['deadline in the wrong format', { targetDeadline: '12/31/2099' }],
    ['referenceLinks that is not an array', { referenceLinks: 'https://example.com' }],
    ['6 reference links', { referenceLinks: Array(6).fill('https://example.com') }],
    ['an ftp link', { referenceLinks: ['ftp://example.com/file'] }],
    ['a javascript link', { referenceLinks: ['javascript:alert(1)'] }],
    ['a link that is not a URL', { referenceLinks: ['not a url'] }],
    ['a link that is not a string', { referenceLinks: [123] }],
    ['intakeAnswers as an array', { intakeAnswers: ['a'] }],
    ['intakeAnswers as a string', { intakeAnswers: 'a' }],
    ['intakeAnswers over 10 KB', { intakeAnswers: { notes: 'a'.repeat(11000) } }],
    ['draft that is not a boolean', { draft: 'true' }],
  ])('returns 400 for %s and saves nothing', async (_label, overrides) => {
    const response = await post(clientA, validBody(overrides));

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: expect.any(String) });
    expect(await countRequests()).toBe(0);
  });

  it.each(['clientId', 'client_id', 'status', 'adminNotes', 'admin_notes', 'somethingElse'])(
    'returns 400 for the unknown field %s and saves nothing',
    async (field) => {
      const response = await post(clientA, validBody({ [field]: 'x' }));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: `Unknown field: ${field}` });
      expect(await countRequests()).toBe(0);
    }
  );

  it('returns 400 with no stack trace for invalid JSON', async () => {
    const response = await request(app)
      .post(REQUESTS_URL)
      .set('Authorization', `Bearer ${clientA.token}`)
      .set('Content-Type', 'application/json')
      .send('{ not json');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Invalid JSON body' });
  });
});

describe('GET /api/v1/requests', () => {
  it('returns only the caller own requests', async () => {
    const mine = await createRequest(clientA, { title: 'Mine' });
    await createRequest(clientB, { title: 'Theirs' });

    const response = await get(clientA);

    expect(response.status).toBe(200);
    expect(response.body.requests.map((item) => item.id)).toEqual([mine.id]);
  });

  it('returns an empty list for a client with no requests', async () => {
    const response = await get(clientA);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ requests: [] });
  });

  it('orders by newest update first and respects ?limit=', async () => {
    const first = await createRequest(clientA, { title: 'First' });
    const second = await createRequest(clientA, { title: 'Second' });
    const third = await createRequest(clientA, { title: 'Third' });
    // Deliberately not the creation order.
    await setUpdatedAt(second.id, '2026-01-03T00:00:00Z');
    await setUpdatedAt(first.id, '2026-01-02T00:00:00Z');
    await setUpdatedAt(third.id, '2026-01-01T00:00:00Z');

    const all = await get(clientA);
    const limited = await get(clientA, '?limit=1');

    expect(all.status).toBe(200);
    expect(all.body.requests.map((item) => item.id)).toEqual([second.id, first.id, third.id]);
    expect(limited.status).toBe(200);
    expect(limited.body.requests.map((item) => item.id)).toEqual([second.id]);
  });

  it('?active=true keeps only submitted, in_review, quoted and in_progress', async () => {
    const statuses = [
      'draft',
      'submitted',
      'in_review',
      'quoted',
      'in_progress',
      'completed',
      'cancelled',
      'declined',
    ];
    for (const status of statuses) {
      const created = await createRequest(clientA, { title: `Request ${status}` });
      await pool.query('UPDATE requests SET status = $1 WHERE id = $2', [status, created.id]);
    }

    const active = await get(clientA, '?active=true');
    const all = await get(clientA, '?active=false');

    expect(active.status).toBe(200);
    expect(active.body.requests.map((item) => item.status).sort()).toEqual([
      'in_progress',
      'in_review',
      'quoted',
      'submitted',
    ]);
    expect(all.status).toBe(200);
    expect(all.body.requests).toHaveLength(8);
  });

  it.each(['limit=0', 'limit=51', 'limit=abc', 'limit=1.5', 'active=yes'])(
    'returns 400 for ?%s',
    async (queryString) => {
      const response = await get(clientA, `?${queryString}`);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: expect.any(String) });
    }
  );
});

describe('GET /api/v1/requests - lastStep', () => {
  async function lastStepOf(requestId) {
    const response = await get(clientA);
    expect(response.status).toBe(200);
    return response.body.requests.find((item) => item.id === requestId).lastStep;
  }

  it('is 1 for a new submitted request and 0 for a draft', async () => {
    const submitted = await createRequest(clientA);
    const draft = await createRequest(clientA, { draft: true });

    expect(await lastStepOf(submitted.id)).toBe(1);
    expect(await lastStepOf(draft.id)).toBe(0);
  });

  it('is the highest step reached for a request cancelled after in_review', async () => {
    const created = await createRequest(clientA);
    await moveTo(created.id, 'submitted', 'in_review');
    await moveTo(created.id, 'in_review', 'cancelled');

    expect(await lastStepOf(created.id)).toBe(2);
  });

  it('is 3 for a request declined after quoted', async () => {
    const created = await createRequest(clientA);
    await moveTo(created.id, 'submitted', 'in_review');
    await moveTo(created.id, 'in_review', 'quoted');
    await moveTo(created.id, 'quoted', 'declined');

    expect(await lastStepOf(created.id)).toBe(3);
  });

  it('is 5 for a completed request', async () => {
    const created = await createRequest(clientA);
    await moveTo(created.id, 'submitted', 'in_review');
    await moveTo(created.id, 'in_review', 'quoted');
    await moveTo(created.id, 'quoted', 'in_progress');
    await moveTo(created.id, 'in_progress', 'completed');

    expect(await lastStepOf(created.id)).toBe(5);
  });
});

describe('GET /api/v1/requests/:id', () => {
  it('returns the request with its history, oldest first', async () => {
    const created = await createRequest(clientA);
    await moveTo(created.id, 'submitted', 'in_review');

    const response = await get(clientA, `/${created.id}`);

    expect(response.status).toBe(200);
    expect(response.body.request.id).toBe(created.id);
    expect(response.body.request.status).toBe('in_review');
    expect(response.body.request.lastStep).toBe(2);
    expect(response.body.request.history).toEqual([
      {
        id: expect.any(String),
        fromStatus: null,
        toStatus: 'submitted',
        note: null,
        createdAt: expect.any(String),
      },
      {
        id: expect.any(String),
        fromStatus: 'submitted',
        toStatus: 'in_review',
        note: null,
        createdAt: expect.any(String),
      },
    ]);
  });

  it("returns 404 for another client's request", async () => {
    const created = await createRequest(clientA);

    const response = await get(clientB, `/${created.id}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Request not found' });
  });

  it('returns 404 for an id that does not exist', async () => {
    const response = await get(clientA, `/${MISSING_ID}`);

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Request not found' });
  });

  it('returns 400 for an id that is not a UUID', async () => {
    const response = await get(clientA, '/123');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: expect.any(String) });
  });
});

describe('/api/v1/requests - access', () => {
  const endpoints = [
    ['POST', 'post', REQUESTS_URL],
    ['GET', 'get', REQUESTS_URL],
    ['GET', 'get', `${REQUESTS_URL}/${MISSING_ID}`],
  ];

  it.each(endpoints)('%s returns 401 without a token (%s %s)', async (_label, method, url) => {
    const response = await request(app)[method](url);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: expect.any(String) });
  });

  it.each(endpoints)('%s returns 403 for an admin (%s %s)', async (_label, method, url) => {
    const response = await request(app)[method](url)
      .set('Authorization', `Bearer ${admin.token}`)
      .send(method === 'post' ? validBody() : undefined);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Forbidden' });
    expect(await countRequests()).toBe(0);
  });
});

describe('/api/v1/requests - admin_notes is never sent to clients', () => {
  const SECRET_NOTE = 'internal note, never show this';

  it('is absent from the create, list and detail responses', async () => {
    const createResponse = await post(clientA, validBody());
    expect(createResponse.status).toBe(201);
    const { id } = createResponse.body.request;
    await pool.query('UPDATE requests SET admin_notes = $1 WHERE id = $2', [SECRET_NOTE, id]);

    const listResponse = await get(clientA);
    const detailResponse = await get(clientA, `/${id}`);

    expect(listResponse.status).toBe(200);
    expect(detailResponse.status).toBe(200);
    for (const response of [createResponse, listResponse, detailResponse]) {
      expect(response.text).not.toContain('adminNotes');
      expect(response.text).not.toContain('admin_notes');
      expect(response.text).not.toContain(SECRET_NOTE);
    }
  });
});
