const userRepository = require('../repositories/user.repository');
const ConflictError = require('../errors/ConflictError');

const EMAIL_TAKEN = 'Email already registered';
const MOBILE_TAKEN = 'Mobile number already registered';

function findByEmail(email) {
  return userRepository.findByEmail(email);
}

function findByMobileNumber(mobileNumber) {
  return userRepository.findByMobileNumber(mobileNumber);
}

// Expects data that is already validated and normalized, with the password already hashed.
async function createUser({ name, email, mobileNumber, passwordHash }) {
  // Friendly check first.
  if (await userRepository.findByEmail(email)) {
    throw new ConflictError(EMAIL_TAKEN);
  }
  if (await userRepository.findByMobileNumber(mobileNumber)) {
    throw new ConflictError(MOBILE_TAKEN);
  }

  // The database is the final guard: two requests at the same moment can both pass the checks above.
  // Postgres error code 23505 = unique violation. The constraint name says which rule was broken.
  try {
    return await userRepository.create({ name, email, mobileNumber, passwordHash });
  } catch (err) {
    if (err.code === '23505') {
      if (err.constraint === 'users_email_unique') throw new ConflictError(EMAIL_TAKEN);
      if (err.constraint === 'users_mobile_number_unique') throw new ConflictError(MOBILE_TAKEN);
    }
    throw err;
  }
}

module.exports = { findByEmail, findByMobileNumber, createUser };
