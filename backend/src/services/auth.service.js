const bcrypt = require('bcryptjs');
const userService = require('./user.service');
const UnauthorizedError = require('../errors/UnauthorizedError');
const NotFoundError = require('../errors/NotFoundError');
const { signToken } = require('../utils/jwt');

// bcrypt only uses the first 72 bytes of a password. Register refuses anything longer.
const MAX_PASSWORD_BYTES = 72;

// 10 = how much work the hash needs. Higher is safer but slower.
const SALT_ROUNDS = 10;

// Same message for "no such email", "no such mobile number" and "wrong password",
// so callers can't find out which accounts exist.
const INVALID_LOGIN = 'Invalid credentials';

// A real hash of a throwaway value. When the email or mobile number is unknown we still compare against it,
// so an unknown identifier takes about as long as a wrong password (otherwise the speed gives it away).
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', SALT_ROUNDS);

async function register({ name, email, mobileNumber, password }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return userService.createUser({ name, email, mobileNumber, passwordHash });
}

// Expects validated input: either { email, password } or { mobileNumber, password }.
// Returns { token, user }. The password hash never leaves this function.
async function login({ email, mobileNumber, password }) {
  const credentials = email
    ? await userService.findCredentialsByEmail(email)
    : await userService.findCredentialsByMobileNumber(mobileNumber);

  // A password over 72 bytes can never be a real one. We still run the compare below (same timing),
  // then answer with the same 401 as any wrong password, so the password policy is not revealed.
  const tooLong = Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES;

  const hashToCheck = credentials ? credentials.passwordHash : DUMMY_HASH;
  const passwordMatches = await bcrypt.compare(password, hashToCheck);

  if (!credentials || tooLong || !passwordMatches) {
    throw new UnauthorizedError(INVALID_LOGIN);
  }

  const token = signToken(credentials.user.id, credentials.user.role);
  return { token, user: credentials.user };
}

// Returns the logged-in user. A valid token whose user was deleted is treated as an invalid token (401).
async function getCurrentUser(userId) {
  try {
    return await userService.getById(userId);
  } catch (err) {
    if (err instanceof NotFoundError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw err;
  }
}

module.exports = { register, login, getCurrentUser };
