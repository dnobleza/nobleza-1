const winston = require('winston');
const { LOG_LEVEL, NODE_ENV } = require('../../config/env');

const isProduction = NODE_ENV === 'production';

// Production: one JSON object per line (easy for tools to read).
// Otherwise: colored, human-readable lines with a timestamp.
const format = isProduction
  ? winston.format.combine(winston.format.timestamp(), winston.format.json())
  : winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp(),
      winston.format.printf(
        ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
      )
    );

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format,
  transports: [new winston.transports.Console()],
});

module.exports = logger;
