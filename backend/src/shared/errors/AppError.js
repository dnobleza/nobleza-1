// An error we throw on purpose, with the HTTP status code to send back.
// Example: throw new AppError('Email already registered', 409);
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}

module.exports = AppError;
