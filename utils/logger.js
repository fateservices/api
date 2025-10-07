const { createLogger, transports, format } = require('winston');
const chalk = require('chalk');

const TIMEZONE = process.env.TIMEZONE || 'America/Los_Angeles';

const logger = createLogger({
  level: 'debug',
  format: format.combine(
    format.timestamp({
      format: () => {
        const dt = new Date();
        return new Intl.DateTimeFormat('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
          timeZone: TIMEZONE
        }).format(dt);
      }
    }),
    format.colorize({ all: true }),
    format.printf(({ timestamp, level, message, ...meta }) => {
      const rest = Object.keys(meta).length ? JSON.stringify(meta) : '';
      return `[${timestamp}] [${level}] ${message} ${rest}`;
    })
  ),
  transports: [
    new transports.Console({ handleExceptions: true }),
    new transports.File({ filename: 'logs/error.log', level: 'error' }),
    new transports.File({ filename: 'logs/warn.log', level: 'warn' }),
    new transports.File({ filename: 'logs/debug.log', level: 'debug' }),
    new transports.File({ filename: 'logs/info.log', level: 'info' }),
    new transports.File({ filename: 'logs/combined.log' })
  ],
  exitOnError: false
});

logger.debugLog = (msg, meta = {}) => logger.debug(msg, meta);
logger.infoLog = (msg, meta = {}) => logger.info(msg, meta);
logger.warnLog = (msg, meta = {}) => logger.warn(msg, meta);
logger.errorLog = (msg, meta = {}) => logger.error(msg, meta);

logger.rawLog = (msg) => {
  console.log(chalk.blue(msg));
};

module.exports = logger;
