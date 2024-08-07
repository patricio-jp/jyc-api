import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';
import {
  CreateUsuarioDTO,
  UpdateUsuarioDTO,
} from '../entities/usuarios/usuarios.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDomicilioDTO } from 'src/entities/domicilios/domicilios.dto';
import { DomicilioUsuario } from 'src/entities/domicilios/domicilios.entity';
import { CreateTelefonoDTO } from 'src/entities/telefonos/telefonos.dto';
import { TelefonoUsuario } from 'src/entities/telefonos/telefonos.entity';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(usuario: CreateUsuarioDTO) {
    try {
      const existentUser = await this.usuariosRepository.findOneBy({
        dni: usuario.dni,
      });
      if (!existentUser) {
        const salt = process.env.HASH_PASSWORD ? process.env.HASH_PASSWORD : 10;
        const hashedPassword = await bcrypt.hash(usuario.password, salt);

        const newUser = this.usuariosRepository.create({
          ...usuario,
          password: hashedPassword,
        });

        return this.usuariosRepository.insert(newUser);
      } else {
        return 'Ya existe un usuario con el DNI ingresado';
      }
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<[Usuario[], number]> {
    return this.usuariosRepository.findAndCount();
  }

  async findOne(id: number) {
    return this.usuariosRepository.findOneBy({ id });
  }

  async update(id: number, updateUsuarioDto: UpdateUsuarioDTO) {
    try {
      const usuario = await this.usuariosRepository.findOneBy({ id });
      if (!usuario) return 'No existe un usuario con el ID ingresado';

      const {
        nombre,
        apellido,
        dni,
        password,
        fechaNacimiento,
        fechaInicio,
        rol,
        domicilios,
        telefonos,
        observaciones,
      } = updateUsuarioDto;

      usuario.nombre = nombre;
      usuario.apellido = apellido;
      usuario.dni = dni;
      usuario.fechaNacimiento = fechaNacimiento;
      usuario.fechaInicio = fechaInicio;
      usuario.rol = rol;
      usuario.observaciones = observaciones;

      if (password) {
        const salt = process.env.HASH_PASSWORD ? process.env.HASH_PASSWORD : 10;
        const hashedPassword = await bcrypt.hash(usuario.password, salt);
        usuario.password = hashedPassword;
      }

      if (domicilios) {
        domicilios.map(async (domicilio: CreateDomicilioDTO) => {
          const nuevoDom = new DomicilioUsuario();
          nuevoDom.direccion = domicilio.direccion;
          nuevoDom.barrio = domicilio.barrio;
          nuevoDom.localidad = domicilio.localidad;

          usuario.domicilios = [...usuario.domicilios, nuevoDom];
          return;
        });
      }

      if (telefonos) {
        telefonos.map(async (telefono: CreateTelefonoDTO) => {
          const nuevoTel = new TelefonoUsuario();
          nuevoTel.telefono = telefono.telefono;

          usuario.telefonos = [...usuario.telefonos, nuevoTel];
          return;
        });
      }

      return await this.usuariosRepository.save(usuario);
    } catch (error) {
      return error;
    }
  }

  async softDelete(id: number) {
    return this.usuariosRepository.softDelete({ id });
  }

  async delete(id: number) {
    return this.usuariosRepository.delete({ id });
  }
}
