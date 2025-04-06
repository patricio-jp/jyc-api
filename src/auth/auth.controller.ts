import {
  Controller,
  Post,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from 'src/entities/usuarios/usuarios.dto';
import { SkipAuth } from 'src/helpers/allowPublicAccess';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }

  @Post('token-refresh')
  async refreshToken(
    @Req() request: Request,
    @Body('token') refreshToken: string,
  ) {
    const token =
      request.headers['authorization']?.split(' ')[1] || refreshToken;
    if (!token) {
      throw new UnauthorizedException('Refresh token not provided');
    }
    return this.authService.refreshToken(token);
  }
}
