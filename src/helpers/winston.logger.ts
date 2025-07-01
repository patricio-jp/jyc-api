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
    // Asegura valor por defecto para la carpeta de logs
    const logDir = path.join(process.env.LOGS_FOLDER || 'logs');

    // Crea el directorio de logs de forma recursiva si no existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
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
      this.logger.add(new winston.transports.Console());
    }
  }

  // Corrige la firma y uso de log para winston v4+
  log(message: any, ...optionalParams: any[]) {
    if (optionalParams && optionalParams.length > 0) {
      this.logger.info(message, ...optionalParams);
    } else {
      this.logger.info(message);
    }
  }

  error(message: string, trace?: string) {
    if (trace) {
      this.logger.error(`${message} - ${trace}`);
    } else {
      this.logger.error(message);
    }
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
    if (logInfo.body && Object.keys(logInfo.body).length !== 0) {
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
    if (logInfo.body && Object.keys(logInfo.body).length !== 0) {
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
