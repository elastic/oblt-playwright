import winston from 'winston';
import {
  CI,
  REPORT_DIR,
} from '../src/env.ts';

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

const outputDirectory = CI === 'true' ? '/home/runner/work/oblt-playwright/' : REPORT_DIR;

const logger = winston.createLogger({
  levels: customLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({
      filename: `${outputDirectory}/execution.json.log`,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    }),
  ],
});

if (process.env.CI !== 'true') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} [${level}]: ${message}`;
      })
    )
  }));
}

winston.addColors(customLevels.colors);

export default logger;