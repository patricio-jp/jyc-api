import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { WinstonLogger } from 'src/helpers/winston.logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new WinstonLogger();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, originalUrl, body } = request;
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
            body,
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
            body,
            error: err.message,
          });
        },
      }),
    );
  }
}
