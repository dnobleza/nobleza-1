const ValidationError = require('../../shared/errors/ValidationError');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Turn "0917 123-4567" or "+63 917 123 4567" into "+639171234567".
// Returns null if it is not a Philippine mobile number.
function normalizeMobileNumber(value) {
  const compact = value.replace(/[\s-]/g, '');
  if (/^09\d{9}$/.test(compact)) return '+63' + compact.slice(1);
  if (/^\+639\d{9}$/.test(compact)) return compact;
  return null;
}

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
  if (!EMAIL_PATTERN.test(email)) {
    throw new ValidationError('email is not a valid email address');
  }

  if (typeof body.mobileNumber !== 'string' || body.mobileNumber.trim() === '') {
    throw new ValidationError('mobileNumber is required');
  }
  const mobileNumber = normalizeMobileNumber(body.mobileNumber);
  if (!mobileNumber) {
    throw new ValidationError(
      'mobileNumber must be a Philippine mobile number (09XXXXXXXXX or +639XXXXXXXXX)'
    );
  }

  if (typeof body.password !== 'string' || body.password === '') {
    throw new ValidationError('password is required');
  }
  if (body.password.length < 8 || body.password.length > 72) {
    throw new ValidationError('password must be 8 to 72 characters');
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

module.exports = { validateRegister };
