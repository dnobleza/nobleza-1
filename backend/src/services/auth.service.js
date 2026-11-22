const bcrypt = require('bcryptjs');
const userService = require('./user.service');

// 10 = how much work the hash needs. Higher is safer but slower.
const SALT_ROUNDS = 10;

async function register({ name, email, mobileNumber, password }) {
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  return userService.createUser({ name, email, mobileNumber, passwordHash });
}

module.exports = { register };
