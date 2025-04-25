import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  EstadoUsuario,
  Rol,
  Usuario,
} from 'src/entities/usuarios/usuarios.entity';
import {
  AskPasswordResetDTO,
  CreateUsuarioDTO,
  RestorePasswordDTO,
  SelfRestorePasswordDTO,
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
  estado?: EstadoUsuario;
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

      const salt = await bcrypt.genSalt(12);
      //console.log(salt);
      const hashedPassword = await bcrypt.hash(usuario.password, salt);

      const newUser = new Usuario();
      newUser.nombre = usuario.nombre;
      newUser.apellido = usuario.apellido;
      newUser.dni = usuario.dni;
      newUser.password = hashedPassword;
      newUser.fechaNacimiento = new Date(usuario.fechaNacimiento.valueOf());
      newUser.fechaInicio = new Date(usuario.fechaInicio.valueOf());
      newUser.rol = usuario.rol;
      newUser.estado = usuario.estado;

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
    const queryAux = this.usuariosRepository.createQueryBuilder('usuario');
    if (!filter.counterQuery) {
      query.leftJoinAndSelect('usuario.domicilios', 'domicilios');
      query.leftJoinAndSelect('usuario.telefonos', 'telefonos');
      if (limit > 0 && page > 0) query.skip((page - 1) * limit).take(limit);
    } else {
      query
        .select('usuario.rol, COUNT(usuario.id) as count')
        .groupBy('usuario.rol');
      queryAux
        .select('usuario.estado, COUNT(usuario.id) as count')
        .groupBy('usuario.estado');
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

    if (filter.estado) {
      query.andWhere('(usuario.estado = :estado)', { estado: filter.estado });
    }

    if (filter.mostrarEliminados) {
      query.withDeleted();
    }

    if (filter.counterQuery) {
      const dataRol = await query.execute();
      const dataEstado = await queryAux.execute();
      let countRol = 0;
      dataRol.forEach((element) => {
        countRol += Number(element.count);
      });
      const data = [...dataRol, ...dataEstado];
      return [data, countRol];
    }

    const [data, count] = await query.getManyAndCount();
    data.forEach((element) => {
      element.password = undefined;
    });
    return [data, count];
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
        fechaNacimiento,
        fechaInicio,
        rol,
        estado,
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
      usuario.estado = estado;
      usuario.observaciones = observaciones;

      /* if (password) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(usuario.password, salt);
        usuario.password = hashedPassword;
      } */

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

  async askForPasswordReset(id: number) {
    try {
      const user = await this.usuariosRepository.findOneBy({ id });
      if (!user)
        throw new BadRequestException(
          'No existe el usuario con el ID ingresado',
        );

      if (user.estado === EstadoUsuario.Deshabilitado)
        throw new BadRequestException(
          'El usuario ya ha solicitado el restablecimiento de contraseña. Espere a que un administrador la restablezca.',
        );
      user.estado = EstadoUsuario.Deshabilitado;
      user.observaciones =
        '[PASSWORD]' + (user.observaciones ? '\n' + user.observaciones : '');

      await this.usuariosRepository.save(user);
      user.password = undefined;
      return user;
    } catch (error) {
      console.error(error);
      return { error };
    }
  }

  async userAskForPasswordReset(dto: AskPasswordResetDTO) {
    const user = await this.usuariosRepository.findOneBy({
      dni: dto.dni,
    });
    if (!user)
      throw new BadRequestException(
        'No existe el usuario con el DNI ingresado',
      );

    if (user.estado === EstadoUsuario.Deshabilitado)
      throw new BadRequestException(
        'El usuario ya ha solicitado el restablecimiento de contraseña. Espere a que un administrador la restablezca.',
      );
    user.estado = EstadoUsuario.Deshabilitado;
    user.observaciones =
      '[PASSWORD]' + (user.observaciones ? '\n' + user.observaciones : '');

    await this.usuariosRepository.save(user);
    user.password = undefined;
    return user;
  }

  async restorePassword(
    id: number,
    passDto: RestorePasswordDTO | SelfRestorePasswordDTO,
  ) {
    const user = await this.usuariosRepository.findOneBy({ id });
    if (!user)
      throw new BadRequestException('No existe el usuario con el ID ingresado');

    if (passDto instanceof SelfRestorePasswordDTO) {
      const isPasswordValid = await bcrypt.compare(
        passDto.oldPassword,
        user.password,
      );
      if (!isPasswordValid)
        throw new UnauthorizedException(
          'La contraseña antigua es incorrecta. Intente de nuevo o pida a otro administrador que restablezca la contraseña.',
        );
    }

    const { password, confirmPassword } = passDto;

    if (password !== confirmPassword)
      throw new BadRequestException('Las contraseñas no coinciden');

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    if (user.estado === EstadoUsuario.Deshabilitado)
      user.estado = EstadoUsuario.Normal;
    if (user.observaciones) {
      user.observaciones = user.observaciones.replace('[PASSWORD]', '').trim();
    }

    await this.usuariosRepository.save(user);
    user.password = undefined;
    return user;
  }

  async softDelete(id: number) {
    return this.usuariosRepository.softDelete({ id });
  }

  async delete(id: number) {
    return this.usuariosRepository.delete({ id });
  }
}
