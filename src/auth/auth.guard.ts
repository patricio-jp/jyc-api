import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/helpers/allowPublicAccess';
import { ApiKeysService } from './api-keys.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private apiKeysService: ApiKeysService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    // First: check for x-api-key header
    const apiKeyHeader = this.extractApiKeyFromHeader(request);
    if (apiKeyHeader) {
      try {
        const apiKeyInfo =
          await this.apiKeysService.validateApiKey(apiKeyHeader);
        request['user'] = { apiKey: true, ...apiKeyInfo };
        return true;
      } catch (e) {
        throw new UnauthorizedException();
      }
    }

    // Fallback to Bearer JWT
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException();
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.HASH_PASSWORD,
      });
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException();
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractApiKeyFromHeader(request: Request): string | undefined {
    // Support both x-api-key and X-API-KEY
    const header =
      request.headers['x-api-key'] ||
      request.headers['x-api-key'.toLowerCase()];
    if (!header) return undefined;
    return Array.isArray(header) ? header[0] : header;
  }
}
