import winston from 'winston';

const customLevels = {
  levels: {
    record: 0,
    error: 1,
    warn: 2,
    info: 3
  },
  colors: {
    record: 'magenta',
    error: 'red',
    warn: 'yellow',
    info: 'green',
  }
};

const customFileFormat = winston.format.printf(({ message, timestamp }) => {
  return `${timestamp}: ${message}`;
});

export const logger = winston.createLogger({
  levels: customLevels.levels,
  transports: [
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level}]: ${message}`;
        })
      )
    }),
    new winston.transports.File({
      level: 'record',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        customFileFormat
      ),
      filename: './playwright-report/perf_results.log'
    })
  ],
});

winston.addColors(customLevels.colors);