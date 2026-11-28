// Checks that a failure inside a transaction saves nothing. Calls the service directly (no HTTP).
const { pool } = require('../src/config/db');
const requestService = require('../src/services/request.service');
const requestRepository = require('../src/repositories/request.repository');

const CLIENT_ID = 'aaaaaaaa-0000-0000-0000-000000000001';

const input = {
  title: 'Company website',
  projectType: 'website',
  description: 'A five page website for our company.',
  budgetRange: '50k_100k',
  budgetPhp: null,
  targetDeadline: null,
  referenceLinks: [],
  intakeAnswers: {},
  draft: false,
};

beforeEach(async () => {
  await pool.query('DELETE FROM users');
  await pool.query(
    `INSERT INTO users (id, name, email, mobile_number, password_hash)
     VALUES ($1, 'Client', 'service@example.com', '+639171234567', 'not-a-real-hash')`,
    [CLIENT_ID]
  );
});

// Put the real functions back after any test that replaced one.
afterEach(() => {
  jest.restoreAllMocks();
});

afterAll(async () => {
  await pool.end();
});

async function countRows() {
  const result = await pool.query(
    `SELECT (SELECT count(*)::int FROM requests) AS requests,
            (SELECT count(*)::int FROM request_status_history) AS history`
  );
  return result.rows[0];
}

describe('requestService.createRequest - transaction', () => {
  it('saves one request and one history row when everything works', async () => {
    await requestService.createRequest(CLIENT_ID, input);

    expect(await countRows()).toEqual({ requests: 1, history: 1 });
  });

  it('saves nothing when the history insert fails after the request insert', async () => {
    // Replace insertHistory with a version that always fails.
    const spy = jest
      .spyOn(requestRepository, 'insertHistory')
      .mockRejectedValue(new Error('history insert failed'));

    await expect(requestService.createRequest(CLIENT_ID, input)).rejects.toThrow(
      'history insert failed'
    );

    expect(spy).toHaveBeenCalledTimes(1);
    expect(await countRows()).toEqual({ requests: 0, history: 0 });
  });

  it('gives the connection back to the pool after a failure', async () => {
    jest.spyOn(requestRepository, 'insertHistory').mockRejectedValue(new Error('boom'));

    await expect(requestService.createRequest(CLIENT_ID, input)).rejects.toThrow('boom');

    // Every open connection is idle again, so none was left checked out.
    expect(pool.idleCount).toBe(pool.totalCount);
  });
});
