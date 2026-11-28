const request = require('supertest');
const app = require('../src/app');
const { pool } = require('../src/config/db');

const REGISTER_URL = '/api/v1/auth/register';
const LOGIN_URL = '/api/v1/auth/login';
const CLIENT_URL = '/api/v1/requests';
const ADMIN_URL = '/api/v1/admin/requests';

const PASSWORD = 'secret123';
const MISSING_ID = '00000000-0000-0000-0000-000000000000';
const OLD_DATE = '2020-01-01T00:00:00.000Z';

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
  return { id, name, email, token: loggedIn.body.token };
}

// Deleting users also deletes their requests and history (ON DELETE CASCADE).
beforeEach(async () => {
  await pool.query('DELETE FROM users');
  clientA = await createUser('Maria Santos', 'maria@example.com', '09171234567');
  clientB = await createUser('Juan Cruz', 'juan@example.com', '09181234567');
  admin = await createUser('Admin User', 'admin@example.com', '09191234567', 'admin');
});

afterAll(async () => {
  await pool.end();
});

function send(user, method, url, body) {
  return request(app)[method](url).set('Authorization', `Bearer ${user.token}`).send(body);
}

const adminGet = (path = '') => send(admin, 'get', `${ADMIN_URL}${path}`);
const changeStatus = (id, body) => send(admin, 'patch', `${ADMIN_URL}/${id}/status`, body);
const saveNotes = (id, body) => send(admin, 'patch', `${ADMIN_URL}/${id}/notes`, body);

// Creates a request as a client through the real API.
async function createRequest(user, overrides = {}) {
  const response = await send(user, 'post', CLIENT_URL, {
    title: 'Company website',
    projectType: 'website',
    description: 'A five page website for our company.',
    budgetRange: '50k_100k',
    ...overrides,
  });
  expect(response.status).toBe(201);
  return response.body.request;
}

// Sets a status directly, to prepare a test. Writes no history.
async function forceStatus(id, status) {
  await pool.query('UPDATE requests SET status = $1 WHERE id = $2', [status, id]);
}

async function setUpdatedAt(id, timestamp) {
  await pool.query('UPDATE requests SET updated_at = $1 WHERE id = $2', [timestamp, id]);
}

async function requestRow(id) {
  const result = await pool.query('SELECT * FROM requests WHERE id = $1', [id]);
  return result.rows[0];
}

async function historyRows(id) {
  const result = await pool.query(
    'SELECT * FROM request_status_history WHERE request_id = $1 ORDER BY created_at, id',
    [id]
  );
  return result.rows;
}

const titles = (response) => response.body.items.map((item) => item.title);

describe('/api/v1/admin/requests - access', () => {
  const endpoints = [
    ['get', () => ADMIN_URL, undefined],
    ['get', (id) => `${ADMIN_URL}/${id}`, undefined],
    ['patch', (id) => `${ADMIN_URL}/${id}/status`, { status: 'in_review' }],
    ['patch', (id) => `${ADMIN_URL}/${id}/notes`, { adminNotes: 'nope' }],
  ];

  it.each(endpoints)('%s %s returns 401 without a token', async (method, url, body) => {
    const { id } = await createRequest(clientA);

    const response = await request(app)[method](url(id)).send(body);

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ error: expect.any(String) });
  });

  it.each(endpoints)('%s %s returns 403 for a client', async (method, url, body) => {
    const { id } = await createRequest(clientA);

    const response = await send(clientA, method, url(id), body);

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: 'Forbidden' });
    const row = await requestRow(id);
    expect(row.status).toBe('submitted');
    expect(row.admin_notes).toBeNull();
    expect(await historyRows(id)).toHaveLength(1);
  });
});

describe('GET /api/v1/admin/requests', () => {
  it('returns every client request except drafts, with exactly these fields', async () => {
    const first = await createRequest(clientA, { title: 'Bakery site', budgetPhp: 60000 });
    await createRequest(clientB, { title: 'Clinic app' });
    await createRequest(clientA, { title: 'Secret draft', draft: true });
    await saveNotes(first.id, { adminNotes: 'private' });

    const response = await adminGet();

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ page: 1, pageSize: 20, total: 2 });
    expect(titles(response).sort()).toEqual(['Bakery site', 'Clinic app']);
    const item = response.body.items.find((entry) => entry.id === first.id);
    expect(item).toEqual({
      id: first.id,
      title: 'Bakery site',
      projectType: 'website',
      budgetRange: '50k_100k',
      budgetPhp: 60000,
      status: 'submitted',
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
      client: { id: clientA.id, name: 'Maria Santos', email: 'maria@example.com' },
    });
  });

  it('returns an empty page when there are no requests', async () => {
    const response = await adminGet();

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ items: [], page: 1, pageSize: 20, total: 0 });
  });

  it('sorts by newest update by default, and oldest on request', async () => {
    const first = await createRequest(clientA, { title: 'First' });
    const second = await createRequest(clientA, { title: 'Second' });
    await setUpdatedAt(first.id, '2026-03-01T00:00:00Z');
    await setUpdatedAt(second.id, '2026-02-01T00:00:00Z');

    expect(titles(await adminGet())).toEqual(['First', 'Second']);
    expect(titles(await adminGet('?sort=newest'))).toEqual(['First', 'Second']);
    expect(titles(await adminGet('?sort=oldest'))).toEqual(['Second', 'First']);
  });

  it('filters by one status or a comma list', async () => {
    await createRequest(clientA, { title: 'New one' });
    const quoted = await createRequest(clientA, { title: 'Quoted one' });
    const done = await createRequest(clientB, { title: 'Done one' });
    await forceStatus(quoted.id, 'quoted');
    await forceStatus(done.id, 'completed');

    const one = await adminGet('?status=submitted');
    const two = await adminGet('?status=submitted,quoted');

    expect(titles(one)).toEqual(['New one']);
    expect(one.body.total).toBe(1);
    expect(titles(two).sort()).toEqual(['New one', 'Quoted one']);
    expect(two.body.total).toBe(2);
  });

  it('searches the title and the client name, ignoring case', async () => {
    await createRequest(clientA, { title: 'Bakery website' });
    await createRequest(clientB, { title: 'Clinic app' });

    expect(titles(await adminGet('?search=BAKERY'))).toEqual(['Bakery website']);
    expect(titles(await adminGet('?search=juan%20cr'))).toEqual(['Clinic app']);
    expect((await adminGet('?search=zzz')).body).toMatchObject({ items: [], total: 0 });
  });

  it('combines search with the status filter, and never finds drafts', async () => {
    const quoted = await createRequest(clientA, { title: 'Shop quoted' });
    await createRequest(clientA, { title: 'Shop new' });
    await createRequest(clientA, { title: 'Shop draft', draft: true });
    await forceStatus(quoted.id, 'quoted');

    expect(titles(await adminGet('?search=shop&status=quoted'))).toEqual(['Shop quoted']);
    expect((await adminGet('?search=shop')).body.total).toBe(2);
  });

  it('treats % _ and \\ in a search as ordinary characters', async () => {
    await createRequest(clientA, { title: 'Save 50% now' });
    await createRequest(clientA, { title: 'snake_case tool' });
    await createRequest(clientA, { title: 'Plain title' });
    await createRequest(clientA, { title: 'Back\\slash' });

    expect(titles(await adminGet('?search=%25'))).toEqual(['Save 50% now']);
    expect(titles(await adminGet('?search=_'))).toEqual(['snake_case tool']);
    expect(titles(await adminGet('?search=%5C'))).toEqual(['Back\\slash']);
  });

  it('matches % and _ only as literal text, not as wildcards', async () => {
    // As wildcards, "50%" would also match "500 flyers", and "a_c" would also match "abc".
    await createRequest(clientA, { title: 'Get 50% off' });
    await createRequest(clientA, { title: 'Print 500 flyers' });
    await createRequest(clientA, { title: 'a_c parts' });
    await createRequest(clientA, { title: 'abc parts' });

    const percent = await adminGet('?search=50%25');
    const underscore = await adminGet('?search=a_c');

    expect(titles(percent)).toEqual(['Get 50% off']);
    expect(percent.body.total).toBe(1);
    expect(titles(underscore)).toEqual(['a_c parts']);
    expect(underscore.body.total).toBe(1);
  });

  it.each(['newest', 'oldest'])(
    'orders ties by id when sorting %s, so pages never repeat or skip rows',
    async (sort) => {
      // 12 rows that all share ONE updated_at.
      const inserted = await pool.query(
        `INSERT INTO requests
           (client_id, title, project_type, description, budget_range, status, updated_at)
         SELECT $1, 'Tie ' || n, 'website', 'A description', 'not_sure', 'submitted',
                timestamptz '2026-01-01'
         FROM generate_series(1, 12) AS n
         RETURNING id`,
        [clientA.id]
      );
      const ascending = inserted.rows.map((row) => row.id).sort();
      const expected = sort === 'newest' ? [...ascending].reverse() : ascending;

      const seen = [];
      for (const page of [1, 2, 3]) {
        const response = await adminGet(`?sort=${sort}&pageSize=5&page=${page}`);
        expect(response.status).toBe(200);
        seen.push(...response.body.items.map((item) => item.id));
      }

      expect(seen).toEqual(expected);
    }
  );

  it('pages through the results and keeps the same total', async () => {
    // 25 rows straight into the table: "Project 25" has the newest update.
    await pool.query(
      `INSERT INTO requests
         (client_id, title, project_type, description, budget_range, status, updated_at)
       SELECT $1, 'Project ' || n, 'website', 'A description', 'not_sure', 'submitted',
              timestamptz '2026-01-01' + n * interval '1 minute'
       FROM generate_series(1, 25) AS n`,
      [clientA.id]
    );

    const first = await adminGet();
    const second = await adminGet('?page=2');
    const third = await adminGet('?page=3');
    const small = await adminGet('?page=2&pageSize=5');

    expect(first.body.items).toHaveLength(20);
    expect(first.body.items[0].title).toBe('Project 25');
    expect(second.body.items).toHaveLength(5);
    expect(second.body.items[4].title).toBe('Project 1');
    expect(third.body.items).toEqual([]);
    expect([first, second, third].map((r) => r.body.total)).toEqual([25, 25, 25]);
    expect(titles(small)).toEqual([
      'Project 20',
      'Project 19',
      'Project 18',
      'Project 17',
      'Project 16',
    ]);
    expect(small.body).toMatchObject({ page: 2, pageSize: 5, total: 25 });
  });

  it.each(['?pageSize=51', '?page=0', '?sort=title', '?status=draft', '?limit=5'])(
    'returns 400 for %s',
    async (query) => {
      const response = await adminGet(query);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: expect.any(String) });
    }
  );
});

describe('GET /api/v1/admin/requests/:id', () => {
  it('returns the full request with client contact, notes and history', async () => {
    const created = await createRequest(clientA, {
      budgetPhp: 80000,
      referenceLinks: ['https://example.com'],
      intakeAnswers: { pages: 5 },
    });
    expect((await changeStatus(created.id, { status: 'in_review', note: 'Reading it' })).status).toBe(200);
    expect((await changeStatus(created.id, { status: 'quoted' })).status).toBe(200);
    await saveNotes(created.id, { adminNotes: 'Ask about hosting' });

    const response = await adminGet(`/${created.id}`);

    expect(response.status).toBe(200);
    const detail = response.body.request;
    expect(detail).toMatchObject({
      id: created.id,
      title: 'Company website',
      description: 'A five page website for our company.',
      projectType: 'website',
      budgetRange: '50k_100k',
      budgetPhp: 80000,
      targetDeadline: null,
      referenceLinks: ['https://example.com'],
      intakeAnswers: { pages: 5 },
      status: 'quoted',
      lastStep: 3,
      adminNotes: 'Ask about hosting',
    });
    expect(detail.client).toEqual({
      id: clientA.id,
      name: 'Maria Santos',
      email: 'maria@example.com',
      mobileNumber: expect.stringContaining('9171234567'),
    });

    const byClient = { id: clientA.id, name: 'Maria Santos' };
    const byAdmin = { id: admin.id, name: 'Admin User' };
    const entry = (fromStatus, toStatus, note, createdBy) => ({
      id: expect.any(String),
      fromStatus,
      toStatus,
      note,
      createdAt: expect.any(String),
      createdBy,
    });
    expect(detail.history).toEqual([
      entry(null, 'submitted', null, byClient),
      entry('submitted', 'in_review', 'Reading it', byAdmin),
      entry('in_review', 'quoted', null, byAdmin),
    ]);
  });

  it('returns 404 for a draft and for a missing id', async () => {
    const draft = await createRequest(clientA, { draft: true });

    for (const id of [draft.id, MISSING_ID]) {
      const response = await adminGet(`/${id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Request not found' });
    }
  });

  it('returns 400 for an id that is not a UUID', async () => {
    const response = await adminGet('/not-a-uuid');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'id must be a valid UUID' });
  });
});

describe('PATCH /api/v1/admin/requests/:id/status', () => {
  it.each([
    ['submitted', 'in_review'],
    ['submitted', 'declined'],
    ['in_review', 'quoted'],
    ['in_review', 'declined'],
    ['quoted', 'in_progress'],
    ['quoted', 'declined'],
    ['in_progress', 'completed'],
  ])('moves %s to %s and writes history by the admin', async (from, to) => {
    const { id } = await createRequest(clientA);
    await forceStatus(id, from);
    await setUpdatedAt(id, OLD_DATE);

    const response = await changeStatus(id, { status: to, note: 'Note for you' });

    expect(response.status).toBe(200);
    expect(response.body.request.status).toBe(to);
    expect(new Date(response.body.request.updatedAt) > new Date(OLD_DATE)).toBe(true);
    expect(response.body.request.history.at(-1)).toMatchObject({
      fromStatus: from,
      toStatus: to,
      note: 'Note for you',
      createdBy: { id: admin.id, name: 'Admin User' },
    });
    expect((await requestRow(id)).status).toBe(to);
    const rows = await historyRows(id);
    expect(rows).toHaveLength(2);
    expect(rows[1]).toMatchObject({
      from_status: from,
      to_status: to,
      note: 'Note for you',
      created_by: admin.id,
    });
  });

  it.each([
    ['submitted', 'submitted'],
    ['in_review', 'in_review'],
    ['submitted', 'quoted'],
    ['submitted', 'completed'],
    ['submitted', 'cancelled'],
    ['submitted', 'draft'],
    ['quoted', 'in_review'],
    ['in_progress', 'declined'],
    ['completed', 'in_progress'],
    ['cancelled', 'in_review'],
    ['declined', 'in_review'],
  ])('returns 409 for %s to %s and writes nothing', async (from, to) => {
    const { id } = await createRequest(clientA);
    await forceStatus(id, from);
    await setUpdatedAt(id, OLD_DATE);

    const response = await changeStatus(id, { status: to });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: `Can't move a request from ${from} to ${to}` });
    const row = await requestRow(id);
    expect(row.status).toBe(from);
    expect(row.updated_at.toISOString()).toBe(OLD_DATE);
    expect(await historyRows(id)).toHaveLength(1);
  });

  it.each([
    ['createdBy', { status: 'in_review', createdBy: MISSING_ID }],
    ['an unknown status', { status: 'done' }],
    ['a note that is too long', { status: 'in_review', note: 'a'.repeat(1001) }],
    ['a null character', { status: 'in_review', note: 'a\u0000b' }],
  ])('returns 400 for %s and writes nothing', async (_label, body) => {
    const { id } = await createRequest(clientA);

    const response = await changeStatus(id, body);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: expect.any(String) });
    expect((await requestRow(id)).status).toBe('submitted');
    expect(await historyRows(id)).toHaveLength(1);
  });

  it('returns 404 for a draft and a missing id, and 400 for a bad id', async () => {
    const draft = await createRequest(clientA, { draft: true });

    for (const id of [draft.id, MISSING_ID]) {
      const response = await changeStatus(id, { status: 'in_review' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Request not found' });
    }
    expect((await requestRow(draft.id)).status).toBe('draft');
    expect((await changeStatus('not-a-uuid', { status: 'in_review' })).status).toBe(400);
  });

  it('shows the note to the client', async () => {
    const { id } = await createRequest(clientA);
    await changeStatus(id, { status: 'in_review', note: 'We are on it' });

    const response = await send(clientA, 'get', `${CLIENT_URL}/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.request.history.at(-1).note).toBe('We are on it');
  });
});

describe('PATCH /api/v1/admin/requests/:id/status - two changes at once', () => {
  // Polls until some query is blocked by the connection with this process id.
  // No fixed sleep: it asks again straight away, and gives up after the timeout.
  async function waitForBlockedBy(pid, timeoutMs = 3000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const result = await pool.query(
        `SELECT count(*)::int AS total FROM pg_stat_activity
         WHERE $1 = ANY(pg_blocking_pids(pid))`,
        [pid]
      );
      if (result.rows[0].total > 0) return;
    }
    throw new Error('The status change never waited for the row lock');
  }

  // The test plays "the other admin": it holds the row lock, then changes the status first.
  it('re-checks the status after waiting for the lock', async () => {
    const { id } = await createRequest(clientA);
    const other = await pool.connect();
    let pending;

    try {
      await other.query('BEGIN');
      const { rows } = await other.query('SELECT pg_backend_pid() AS pid');
      await other.query('SELECT id FROM requests WHERE id = $1 FOR UPDATE', [id]);
      // .then() is what actually sends a supertest request.
      pending = changeStatus(id, { status: 'in_review' }).then((response) => response);
      await waitForBlockedBy(rows[0].pid);
      await other.query("UPDATE requests SET status = 'in_review' WHERE id = $1", [id]);
      await other.query('COMMIT');
    } finally {
      // true = close this connection for good. That also frees its lock if something failed above.
      other.release(true);
    }

    const response = await pending;
    expect(response.status).toBe(409);
    expect(response.body).toEqual({ error: "Can't move a request from in_review to in_review" });
    expect(await historyRows(id)).toHaveLength(1);
  });

  it('lets only one of two simultaneous requests succeed', async () => {
    const { id } = await createRequest(clientA);

    const responses = await Promise.all([
      changeStatus(id, { status: 'in_review' }),
      changeStatus(id, { status: 'in_review' }),
    ]);

    expect(responses.map((r) => r.status).sort()).toEqual([200, 409]);
    expect(await historyRows(id)).toHaveLength(2);
  });
});

describe('PATCH /api/v1/admin/requests/:id/notes', () => {
  it('saves the notes without touching status, updated_at or history', async () => {
    const { id } = await createRequest(clientA);
    await setUpdatedAt(id, OLD_DATE);

    const response = await saveNotes(id, { adminNotes: '  Prefers email  ' });

    expect(response.status).toBe(200);
    expect(response.body.request).toMatchObject({
      id,
      adminNotes: 'Prefers email',
      status: 'submitted',
      updatedAt: OLD_DATE,
    });
    expect((await requestRow(id)).admin_notes).toBe('Prefers email');
    expect(await historyRows(id)).toHaveLength(1);
  });

  it('clears the notes with an empty string', async () => {
    const { id } = await createRequest(clientA);
    await saveNotes(id, { adminNotes: 'Something' });

    const response = await saveNotes(id, { adminNotes: '' });

    expect(response.status).toBe(200);
    expect(response.body.request.adminNotes).toBeNull();
    expect((await requestRow(id)).admin_notes).toBeNull();
  });

  it('returns 400 for bad input and keeps the old notes', async () => {
    const { id } = await createRequest(clientA);
    await saveNotes(id, { adminNotes: 'Keep me' });

    for (const body of [{ adminNotes: 'a'.repeat(5001) }, { adminNotes: 'x', status: 'completed' }]) {
      const response = await saveNotes(id, body);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: expect.any(String) });
    }
    expect((await requestRow(id)).admin_notes).toBe('Keep me');
  });

  it('returns 404 for a draft and for a missing id', async () => {
    const draft = await createRequest(clientA, { draft: true });

    for (const id of [draft.id, MISSING_ID]) {
      const response = await saveNotes(id, { adminNotes: 'x' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Request not found' });
    }
    expect((await requestRow(draft.id)).admin_notes).toBeNull();
  });
});

describe('admin notes are never sent to clients (regression)', () => {
  const SECRET_NOTE = 'internal note, never show this';

  it('stays out of the client list and detail after the admin saves it', async () => {
    const { id } = await createRequest(clientA);
    expect((await saveNotes(id, { adminNotes: SECRET_NOTE })).status).toBe(200);

    const list = await send(clientA, 'get', CLIENT_URL);
    const detail = await send(clientA, 'get', `${CLIENT_URL}/${id}`);

    for (const response of [list, detail]) {
      expect(response.status).toBe(200);
      expect(response.text).not.toContain('adminNotes');
      expect(response.text).not.toContain('admin_notes');
      expect(response.text).not.toContain(SECRET_NOTE);
    }
  });
});
