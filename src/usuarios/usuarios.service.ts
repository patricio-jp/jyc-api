import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Rol, Usuario } from 'src/entities/usuarios/usuarios.entity';
import {
  CreateUsuarioDTO,
  UpdateUsuarioDTO,
} from '../entities/usuarios/usuarios.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDomicilioDTO } from 'src/entities/domicilios/domicilios.dto';
import { DomicilioUsuario } from 'src/entities/domicilios/domicilios.entity';
import { CreateTelefonoDTO } from 'src/entities/telefonos/telefonos.dto';
import { TelefonoUsuario } from 'src/entities/telefonos/telefonos.entity';

interface UsuariosFilter {
  counterQuery?: boolean;
  searchTerm?: string; // Usado para campos simples de la entidad
  domicilio?: string;
  rol?: Rol;
  mostrarEliminados?: boolean;
}

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
      if (existentUser) {
        return { message: 'Ya existe un usuario con el DNI ingresado' };
      }

      const salt = await bcrypt.genSalt(10);
      console.log(salt);
      const hashedPassword = await bcrypt.hash(usuario.password, salt);

      const newUser = new Usuario();
      newUser.nombre = usuario.nombre;
      newUser.apellido = usuario.apellido;
      newUser.dni = usuario.dni;
      newUser.password = hashedPassword;
      newUser.fechaNacimiento = new Date(usuario.fechaNacimiento.valueOf());
      newUser.fechaInicio = new Date(usuario.fechaInicio.valueOf());
      newUser.rol = usuario.rol;

      if (usuario.domicilios) {
        const domicilios = await Promise.all(
          usuario.domicilios.map(async (domicilio: CreateDomicilioDTO) => {
            const nuevoDom = new DomicilioUsuario();
            nuevoDom.direccion = domicilio.direccion;
            nuevoDom.barrio = domicilio.barrio;
            nuevoDom.localidad = domicilio.localidad;

            return nuevoDom;
          }),
        );
        newUser.domicilios = domicilios;
      }

      if (usuario.telefonos) {
        const telefonos = await Promise.all(
          usuario.telefonos.map(async (telefono: CreateTelefonoDTO) => {
            const nuevoTel = new TelefonoUsuario();
            nuevoTel.telefono = telefono.telefono;

            return nuevoTel;
          }),
        );
        newUser.telefonos = telefonos;
      }

      return this.usuariosRepository.save(newUser);
    } catch (error) {
      console.error(error);
      return { error };
    }
  }

  async findAll(
    page: number,
    limit: number,
    filter: UsuariosFilter,
  ): Promise<[Usuario[], number]> {
    const query = this.usuariosRepository.createQueryBuilder('usuario');
    if (!filter.counterQuery) {
      query.leftJoinAndSelect('usuario.domicilios', 'domicilios');
      query.leftJoinAndSelect('usuario.telefonos', 'telefonos');
      if (limit > 0 && page > 0) query.skip((page - 1) * limit).take(limit);
    } else {
      query
        .select('usuario.rol, COUNT(usuario.id) as count')
        .groupBy('usuario.rol');
    }

    if (filter.searchTerm) {
      query.andWhere(
        '(usuario.id LIKE :usuario OR usuario.dni LIKE :usuario OR usuario.nombre LIKE :usuario OR usuario.apellido LIKE :usuario OR domicilios.direccion LIKE :usuario OR domicilios.barrio LIKE :usuario OR domicilios.localidad LIKE :usuario)',
        { usuario: `%${filter.searchTerm}%` },
      );
    }

    if (filter.domicilio) {
      query.andWhere(
        '(domicilios.direccion LIKE :usuario OR domicilios.barrio LIKE :usuario OR domicilios.localidad LIKE :usuario)',
        { usuario: `%${filter.domicilio}%` },
      );
    }

    if (filter.rol) {
      query.andWhere('(usuario.rol = :rol)', { rol: filter.rol });
    }

    if (filter.mostrarEliminados) {
      query.withDeleted();
    }

    if (filter.counterQuery) {
      const data = await query.execute();
      let count = 0;
      data.forEach((element) => {
        count += Number(element.count);
      });
      return [data, count];
    }

    return await query.getManyAndCount();
  }

  async findOne(id: number) {
    const user = await this.usuariosRepository.findOne({
      where: { id },
      relations: {
        domicilios: true,
        telefonos: true,
        clientesAsociados: {
          domicilios: true,
          telefonos: true,
          zona: true,
          ventas: {
            productos: {
              producto: true,
            },
            financiacion: {
              carton: {
                grupoCartones: true,
              },
            },
          },
        },
        clientesACobrar: {
          domicilios: true,
          telefonos: true,
          zona: true,
          ventas: {
            productos: {
              producto: true,
            },
            financiacion: {
              carton: {
                grupoCartones: true,
              },
            },
          },
        },
      },
      withDeleted: true,
    });

    user.password = undefined;
    return user;
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
