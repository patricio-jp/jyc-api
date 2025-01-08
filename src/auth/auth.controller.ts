import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from 'src/entities/usuarios/usuarios.dto';
import { SkipAuth } from 'src/helpers/allowPublicAccess';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @SkipAuth()
  @Post('login')
  async login(@Body() loginDto: LoginDTO) {
    return this.authService.login(loginDto);
  }

  @SkipAuth()
  @Post('token-refresh')
  async refreshToken(@Body('token') oldToken: string) {
    return this.authService.refreshToken(oldToken);
  }
}
