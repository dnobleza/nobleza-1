const usersRepository = require('./users.repository');
const ConflictError = require('../../shared/errors/ConflictError');

const EMAIL_TAKEN = 'Email already registered';
const MOBILE_TAKEN = 'Mobile number already registered';

function findByEmail(email) {
  return usersRepository.findByEmail(email);
}

function findByMobileNumber(mobileNumber) {
  return usersRepository.findByMobileNumber(mobileNumber);
}

// Expects data that is already validated and normalized, with the password already hashed.
async function createUser({ name, email, mobileNumber, passwordHash }) {
  // Friendly check first.
  if (await usersRepository.findByEmail(email)) {
    throw new ConflictError(EMAIL_TAKEN);
  }
  if (await usersRepository.findByMobileNumber(mobileNumber)) {
    throw new ConflictError(MOBILE_TAKEN);
  }

  // The database is the final guard: two requests at the same moment can both pass the checks above.
  // Postgres error code 23505 = unique violation. The constraint name says which rule was broken.
  try {
    return await usersRepository.create({ name, email, mobileNumber, passwordHash });
  } catch (err) {
    if (err.code === '23505') {
      if (err.constraint === 'users_email_unique') throw new ConflictError(EMAIL_TAKEN);
      if (err.constraint === 'users_mobile_number_unique') throw new ConflictError(MOBILE_TAKEN);
    }
    throw err;
  }
}

module.exports = { findByEmail, findByMobileNumber, createUser };
