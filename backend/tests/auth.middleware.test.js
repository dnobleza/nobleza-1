// Unit tests for the auth middleware. No database and no server: we call the functions directly.
const jwt = require('jsonwebtoken');
const { requireAuth, requireRole } = require('../src/middlewares/auth.middleware');

// setup-env.js loads backend/.env, so the same secret the app uses is available here.
const SECRET = process.env.JWT_SECRET;
const USER_ID = '11111111-1111-1111-1111-111111111111';

// Runs requireRole with a fake req. next is a fake function that records whether it was called.
function runRequireRole(role, user) {
  const next = jest.fn();
  requireRole(role)({ user }, {}, next);
  return next;
}

// Returns the error a function throws, so we can check both its status code and message.
function errorFrom(fn) {
  try {
    fn();
  } catch (err) {
    return err;
  }
  throw new Error('Expected an error, but nothing was thrown');
}

describe('requireRole - allowed', () => {
  it('lets a client through requireRole("client")', () => {
    const next = runRequireRole('client', { id: USER_ID, role: 'client' });

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('lets an admin through requireRole("admin")', () => {
    const next = runRequireRole('admin', { id: USER_ID, role: 'admin' });

    expect(next).toHaveBeenCalledTimes(1);
  });
});

describe('requireRole - refused', () => {
  it.each([
    ['admin', 'client'],
    ['client', 'admin'],
  ])('requireRole("%s") refuses role "%s" with 403', (required, actual) => {
    const err = errorFrom(() => runRequireRole(required, { id: USER_ID, role: actual }));

    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Forbidden');
  });

  it('refuses a user with no role with 403', () => {
    const err = errorFrom(() => runRequireRole('client', { id: USER_ID }));

    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Forbidden');
  });

  it('refuses with 401 when requireAuth did not run (no req.user)', () => {
    const err = errorFrom(() => runRequireRole('client', undefined));

    expect(err.statusCode).toBe(401);
  });
});

describe('requireAuth - role from the token', () => {
  it('sets req.user to the id and role from the token', () => {
    const token = jwt.sign({ sub: USER_ID, role: 'admin' }, SECRET, { expiresIn: '1h' });
    const req = { headers: { authorization: `Bearer ${token}` } };

    requireAuth(req, {}, jest.fn());

    expect(req.user).toEqual({ id: USER_ID, role: 'admin' });
  });
});
