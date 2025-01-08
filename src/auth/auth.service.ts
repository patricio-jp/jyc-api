import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginDTO } from 'src/entities/usuarios/usuarios.dto';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async login(
    usuario: LoginDTO,
  ): Promise<{ access_token: string; refresh_token: string }> {
    const { dni, password } = usuario;
    const user = await this.usuariosRepository.findOneBy({ dni });

    if (!user) {
      throw new UnauthorizedException();
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = {
      apellido: user.apellido,
      nombre: user.nombre,
      dni: user.dni,
      sub: user.id,
      rol: user.rol,
    };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    }); // Access token expires in 15 minutes
    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '3h',
    }); // Refresh token expires in 3 hours

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<{ access_token: string; refresh_token: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usuariosRepository.findOneBy({
        dni: payload.dni,
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      const newPayload = {
        apellido: user.apellido,
        nombre: user.nombre,
        dni: user.dni,
        sub: user.id,
        rol: user.rol,
      };
      const newAccessToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '15m',
      }); // Access token expires in 15 minutes
      const newRefreshToken = await this.jwtService.signAsync(newPayload, {
        expiresIn: '3h',
      }); // Refresh token expires in 3 hours

      return { access_token: newAccessToken, refresh_token: newRefreshToken };
    } catch (e) {
      throw new UnauthorizedException();
    }
  }

  async logout() {
    return 'This action logs a user out';
  }
}
