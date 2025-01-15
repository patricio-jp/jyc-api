import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import * as path from 'path';
import * as fs from 'fs';
import 'winston-daily-rotate-file';

interface LogPetition {
  message: string;
  method: string;
  route: string;
  statusCode: number;
  ip: string;
  user: string;
  body: any;
  file?: string;
}

interface LogError extends LogPetition {
  error: string;
}

@Injectable()
export class WinstonLogger implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const logDir = path.join(process.cwd(), 'logs');

    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir);
    }

    this.logger = winston.createLogger({
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message }) => {
          return `${timestamp} [${level.toUpperCase()}]: ${message}`;
        }),
      ),
      transports: [
        new winston.transports.DailyRotateFile({
          filename: 'app-%DATE%.log',
          dirname: logDir,
          datePattern: 'DD-MM-YYYY',
          zippedArchive: false,
          //maxSize: '20m',
          //maxFiles: '14d',
        }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      // APP_ENV is accessed from env file
      this.logger.add(new winston.transports.Console());
    }
  }

  log(message: any, ...optionalParams: any[]) {
    this.logger.log(message, optionalParams);
  }

  error(message: string, trace?: string) {
    this.logger.error(`${message} - ${trace}`);
  }

  warn(message: string) {
    this.logger.warn(message);
  }

  debug(message: string) {
    this.logger.debug(message);
  }

  info(message: string) {
    this.logger.info(message);
  }

  logPetition(logInfo: LogPetition) {
    let message = '';
    if (Object.keys(logInfo.body).length !== 0) {
      message = `[${logInfo.method}] ${logInfo.route} | ${logInfo.statusCode}  made from ${logInfo.ip} - User: ${logInfo.user} - Req.Body: ${JSON.stringify(logInfo.body)}`;
      if (logInfo.file) {
        message += ` - ${logInfo.file}`;
      }
    } else {
      message = `[${logInfo.method}] ${logInfo.route} | ${logInfo.statusCode}  made from ${logInfo.ip} - User: ${logInfo.user}`;
    }
    this.logger.info(message);
  }

  logError(logInfo: LogError) {
    let message = '';
    if (Object.keys(logInfo.body).length !== 0) {
      message = `[${logInfo.method}] ${logInfo.route} | ${logInfo.statusCode}  made from ${logInfo.ip} - User: ${logInfo.user} - Req.Body: ${JSON.stringify(logInfo.body)} - Error: ${logInfo.error}`;
      if (logInfo.file) {
        message += ` - ${logInfo.file}`;
      }
    } else {
      message = `[${logInfo.method}] ${logInfo.route} | ${logInfo.statusCode}  made from ${logInfo.ip} - User: ${logInfo.user} - Error: ${logInfo.error}`;
    }
    this.logger.error(message);
  }
}
