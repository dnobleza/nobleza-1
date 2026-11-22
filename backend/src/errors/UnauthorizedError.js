const AppError = require('./AppError');

// 401: the caller is not logged in, or their login details / token are not valid.
class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401);
    this.name = 'UnauthorizedError';
  }
}

module.exports = UnauthorizedError;
