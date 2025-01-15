import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WinstonLogger } from 'src/helpers/winston.logger';
import busboy = require('busboy');

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new WinstonLogger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, originalUrl, body } = request;

    let requestBody = body;
    let fileInfo: string;

    if (method === 'POST' && request.is('multipart/form-data')) {
      //console.log('File:', file);
      const bb = busboy({ headers: request.headers });

      bb.on('file', (fieldname, file, filename) => {
        //console.log('File:', { fieldname, filename });
        file.on('data', (data) => {
          //console.log(`File [${file.toString()}] got ${data.length} bytes`);
          fileInfo = `[File uploaded]: ${filename.filename} [${data.length} bytes] [encoding: ${filename.mimeType}]`;
        });
      });

      bb.on('field', (name, value) => {
        //console.log('Data: ', { name, value, info });
        requestBody = JSON.parse(value);
      });
      //console.log('Files:', files);
      request.pipe(bb);
    }

    const user = request.user ? request.user.sub : 'Anonymous';

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response;
          this.logger.logPetition({
            message: 'HTTP Request',
            method,
            route: originalUrl,
            statusCode,
            ip: request.ip,
            user,
            body: requestBody,
            file: fileInfo,
          });
        },
        error: (err) => {
          const { statusCode } = response;
          this.logger.logError({
            message: 'HTTP Request Error',
            method,
            route: originalUrl,
            statusCode: statusCode || 500,
            ip: request.ip,
            user,
            body: requestBody,
            file: fileInfo,
            error: err.message,
          });
        },
      }),
    );
  }
}
