const ValidationError = require('../errors/ValidationError');
const { normalizeMobileNumber } = require('../utils/mobileNumber');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Runs before the controller. On success, replaces req.body with the cleaned values.
function validateRegister(req, res, next) {
  const body = req.body || {};

  if (typeof body.name !== 'string' || body.name.trim() === '') {
    throw new ValidationError('name is required');
  }
  const name = body.name.trim();
  if (name.length > 100) {
    throw new ValidationError('name must be at most 100 characters');
  }

  if (typeof body.email !== 'string' || body.email.trim() === '') {
    throw new ValidationError('email is required');
  }
  const email = body.email.trim().toLowerCase();
  if (email.length > 254) {
    throw new ValidationError('email must be at most 254 characters');
  }
  if (!EMAIL_PATTERN.test(email)) {
    throw new ValidationError('email is not a valid email address');
  }

  if (
    typeof body.mobileNumber !== 'string' ||
    body.mobileNumber.trim() === ''
  ) {
    throw new ValidationError('mobileNumber is required');
  }
  const mobileNumber = normalizeMobileNumber(body.mobileNumber);
  if (!mobileNumber) {
    throw new ValidationError(
      'mobileNumber must be a Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX)',
    );
  }

  if (typeof body.password !== 'string' || body.password === '') {
    throw new ValidationError('password is required');
  }
  if (body.password.length < 8) {
    throw new ValidationError('password must be at least 8 characters');
  }
  // bcrypt only uses the first 72 BYTES. Some characters (like "é" or emoji) are more than 1 byte,
  // so we count bytes, not characters. Otherwise the extra part would be silently ignored.
  if (Buffer.byteLength(body.password, 'utf8') > 72) {
    throw new ValidationError(
      'password must be at most 72 bytes (some characters use more than 1 byte)',
    );
  }

  if (typeof body.confirmPassword !== 'string' || body.confirmPassword === '') {
    throw new ValidationError('confirmPassword is required');
  }
  if (body.confirmPassword !== body.password) {
    throw new ValidationError('confirmPassword must match password');
  }

  // confirmPassword is dropped here on purpose: it is only used for validation.
  req.body = { name, email, mobileNumber, password: body.password };
  next();
}

// Runs before the login controller. No password length rule here on purpose:
// login should not reveal the password policy. A wrong password simply gets the 401.
// "identifier" is an email (if it has "@") or a Philippine mobile number.
// On success, req.body is { email, password } or { mobileNumber, password }.
function validateLogin(req, res, next) {
  const body = req.body || {};

  if (typeof body.identifier !== 'string' || body.identifier.trim() === '') {
    throw new ValidationError('Email or mobile number is required');
  }
  const identifier = body.identifier.trim();
  const IDENTIFIER_INVALID =
    'identifier must be a valid email or Philippine mobile number';
  if (identifier.length > 254) {
    throw new ValidationError(IDENTIFIER_INVALID);
  }

  let lookup;
  if (identifier.includes('@')) {
    const email = identifier.toLowerCase();
    if (!EMAIL_PATTERN.test(email)) {
      throw new ValidationError(IDENTIFIER_INVALID);
    }
    lookup = { email };
  } else {
    const mobileNumber = normalizeMobileNumber(identifier);
    if (!mobileNumber) {
      throw new ValidationError(IDENTIFIER_INVALID);
    }
    lookup = { mobileNumber };
  }

  if (typeof body.password !== 'string' || body.password === '') {
    throw new ValidationError('password is required');
  }

  req.body = { ...lookup, password: body.password };
  next();
}

module.exports = { validateRegister, validateLogin };
