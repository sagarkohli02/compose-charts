import { createLogger, format, transports } from "winston";

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};

const defaultLoggerConfig = {
  levels: logLevels,
  // level: 'trace',
  // level: 'error',
  format: format.combine(format.timestamp(), format.json()),
  transports: [new transports.Console({})],
  // exceptionHandlers: [new transports.File({ filename: "exceptions.log" })],
  // rejectionHandlers: [new transports.File({ filename: "rejections.log" })],
  defaultMeta: {
    // service: "scrapper-service",
    get serviceName() {
      return "generic-service-must-be changed";
    }
  },
}
const logger = createLogger(defaultLoggerConfig);

export {
  logger,
  defaultLoggerConfig
}