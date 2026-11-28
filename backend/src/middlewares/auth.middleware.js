const UnauthorizedError = require('../errors/UnauthorizedError');
const ForbiddenError = require('../errors/ForbiddenError');
const { verifyToken } = require('../utils/jwt');

// Put this before a controller to make a route login-only.
// Expects the header:  Authorization: Bearer <token>
// On success, sets req.user = { id, role } and moves on. Otherwise throws a 401.
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header) {
    throw new UnauthorizedError('Authentication required');
  }

  const [scheme, token, ...rest] = header.split(' ');
  if (scheme.toLowerCase() !== 'bearer' || !token || rest.length > 0) {
    throw new UnauthorizedError('Authorization header must be: Bearer <token>');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Token expired');
    }
    throw new UnauthorizedError('Invalid token');
  }

  // A token without a user id is not one of ours.
  if (typeof payload.sub !== 'string' || payload.sub === '') {
    throw new UnauthorizedError('Invalid token');
  }

  req.user = { id: payload.sub, role: payload.role };
  next();
}

// Put this AFTER requireAuth to allow only one role, e.g. requireRole('admin').
// It does not check anything itself: it builds and returns the middleware that does.
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) {
      throw new UnauthorizedError('Authentication required');
    }
    if (req.user.role !== role) {
      throw new ForbiddenError('Forbidden');
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
