const winston = require('winston');
const path = require('path');

// ================= LEVELS =================
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// ================= COLORS =================
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);


// ================= FORMATS =================

// Dev format (pretty)
const devFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Prod format (JSON)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);


// ================= TRANSPORTS =================
const transports = [
  new winston.transports.Console(),

  new winston.transports.File({
    filename: path.join('logs', 'error.log'),
    level: 'error',
  }),

  new winston.transports.File({
    filename: path.join('logs', 'combined.log'),
  }),
];


// ================= LOGGER =================
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  levels,
  format: process.env.NODE_ENV === 'production' ? prodFormat : devFormat,
  transports,
  exitOnError: false,
});


// ================= HELPER METHODS =================

// For HTTP logs
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

module.exports = logger;