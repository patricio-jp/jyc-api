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

  async login(usuario: LoginDTO): Promise<{ access_token: string }> {
    const { dni, password } = usuario;
    const user = await this.usuariosRepository.findOneBy({ dni });

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = { dni: user.dni, sub: user.id };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }

  async logout() {
    return 'This action logs a user out';
  }
}
