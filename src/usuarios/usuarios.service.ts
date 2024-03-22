import { Inject, Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { USUARIOS_REPOSITORY } from 'src/constants/constants';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';
import {
  CreateUsuarioDTO,
  UpdateUsuarioDTO,
} from '../entities/usuarios/usuarios.dto';

@Injectable()
export class UsuariosService {
  constructor(
    @Inject(USUARIOS_REPOSITORY)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(usuario: CreateUsuarioDTO) {
    try {
      const salt = process.env.HASH_PASSWORD ? process.env.HASH_PASSWORD : 10;
      const hashedPassword = await bcrypt.hash(usuario.password, salt);

      const newUser = this.usuariosRepository.create({
        ...usuario,
        password: hashedPassword,
      });

      return this.usuariosRepository.insert(newUser);
    } catch (error) {
      return null;
    }
  }

  async findAll() {
    return this.usuariosRepository.findAndCount();
  }

  async findOne(id: number) {
    return this.usuariosRepository.findOneBy({ id });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDTO) {
    return this.usuariosRepository.update({ id }, updateUsuarioDto);
  }

  async softDelete(id: number) {
    return this.usuariosRepository.softDelete({ id });
  }

  async delete(id: number) {
    return this.usuariosRepository.delete({ id });
  }
}
