const AppError = require('./AppError');

// 403: we know who the caller is, but they are not allowed to do this.
class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403);
    this.name = 'ForbiddenError';
  }
}

module.exports = ForbiddenError;
