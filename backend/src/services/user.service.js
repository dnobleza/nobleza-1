const userRepository = require('../repositories/user.repository');
const ConflictError = require('../errors/ConflictError');
const NotFoundError = require('../errors/NotFoundError');

const EMAIL_TAKEN = 'Email already registered';
const MOBILE_TAKEN = 'Mobile number already registered';

function findByEmail(email) {
  return userRepository.findByEmail(email);
}

function findByMobileNumber(mobileNumber) {
  return userRepository.findByMobileNumber(mobileNumber);
}

// Returns the user, or throws 404 if there is no user with this id.
async function getById(id) {
  const user = await userRepository.findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}

// For login only. Returns { user, passwordHash }, or null if the email is unknown.
function findCredentialsByEmail(email) {
  return userRepository.findByEmailWithPassword(email);
}

// For login only. Returns { user, passwordHash }, or null if the mobile number is unknown.
function findCredentialsByMobileNumber(mobileNumber) {
  return userRepository.findByMobileNumberWithPassword(mobileNumber);
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

module.exports = {
  findByEmail,
  findByMobileNumber,
  getById,
  findCredentialsByEmail,
  findCredentialsByMobileNumber,
  createUser,
};
