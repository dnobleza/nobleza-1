const AppError = require('../errors/AppError');
const logger = require('../utils/logger');

// Express knows this is an error handler because it has 4 parameters.
// It must be mounted LAST in app.js.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  // Errors we threw on purpose: send their message and status.
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // express.json() throws this when the request body is not valid JSON.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  // Other body-parser errors (body too large, wrong encoding, ...) carry a 4xx status and a type.
  // These are the client's fault, so send the status with a safe message and do not log a stack trace.
  if (err.type && err.status >= 400 && err.status < 500) {
    const message = err.status === 413 ? 'Request body too large' : 'Invalid request body';
    return res.status(err.status).json({ error: message });
  }

  // Anything else is unexpected: log the real error, hide details from the client.
  logger.error(err.stack || err.message);
  return res.status(500).json({ error: 'Internal server error' });
}

module.exports = errorHandler;
