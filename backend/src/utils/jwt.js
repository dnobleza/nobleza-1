const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

// We only ever use one signing algorithm. Verifying with the same one stops tokens made another way.
const ALGORITHM = 'HS256';

// Make a token that says "this is user <userId> with this role" and expires after JWT_EXPIRES_IN.
// The role is fixed until the token expires: changing it in the database needs a new login.
function signToken(userId, role) {
  return jwt.sign({ sub: userId, role }, JWT_SECRET, {
    algorithm: ALGORITHM,
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Check the signature and the expiry. Returns the payload, or throws
// (TokenExpiredError for an old token, JsonWebTokenError for any other bad token).
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { algorithms: [ALGORITHM] });
}

module.exports = { signToken, verifyToken };
