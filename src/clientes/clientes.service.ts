import { Injectable } from '@nestjs/common';
import {
  CreateClienteDTO,
  UpdateClienteDTO,
} from 'src/entities/clientes/clientes.dto';
import { Repository } from 'typeorm';
import { Cliente, EstadoCliente } from 'src/entities/clientes/clientes.entity';
import { CreateDomicilioDTO } from 'src/entities/domicilios/domicilios.dto';
import { DomicilioCliente } from 'src/entities/domicilios/domicilios.entity';
import { CreateTelefonoDTO } from 'src/entities/telefonos/telefonos.dto';
import { TelefonoCliente } from 'src/entities/telefonos/telefonos.entity';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';
import { InjectRepository } from '@nestjs/typeorm';

interface ClientesFilter {
  counterQuery?: boolean;
  searchTerm?: string; // Usado para campos simples de la entidad
  domicilio?: string;
  estado?: EstadoCliente;
  zona?: string;
  apariciones?: string;
  mostrarEliminados?: boolean;
}

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createClienteDto: CreateClienteDTO) {
    try {
      const {
        nombre,
        apellido,
        dni,
        fechaNacimiento,
        domicilios,
        telefonos,
        id_vendedorAsociado,
        vendedorAsociadoHasta,
        id_cobradorAsociado,
        saldo,
        observaciones,
        estado,
      } = createClienteDto;

      const existent = await this.clientesRepository.findOneBy({
        dni,
      });
      if (existent) return 'Ya existe un cliente con el DNI ingresado';

      const nuevoCliente = new Cliente();
      nuevoCliente.nombre = nombre;
      nuevoCliente.apellido = apellido;
      nuevoCliente.dni = dni;
      nuevoCliente.fechaNacimiento = new Date(fechaNacimiento.valueOf());
      nuevoCliente.saldo = saldo ? saldo : 0;
      nuevoCliente.observaciones = observaciones;
      nuevoCliente.estado = estado ? estado : EstadoCliente.AConfirmar;

      await nuevoCliente.save();

      if (domicilios) {
        const nuevosDomicilios = await Promise.all(
          domicilios.map(async (domicilio: CreateDomicilioDTO) => {
            const nuevoDom = new DomicilioCliente();
            nuevoDom.direccion = domicilio.direccion;
            nuevoDom.barrio = domicilio.barrio;
            nuevoDom.localidad = domicilio.localidad;

            return nuevoDom;
          }),
        );
        nuevoCliente.domicilios = nuevosDomicilios;
      }

      if (telefonos) {
        const nuevosTelefonos = await Promise.all(
          telefonos.map(async (telefono: CreateTelefonoDTO) => {
            const nuevoTel = new TelefonoCliente();
            nuevoTel.telefono = telefono.telefono;

            return nuevoTel;
          }),
        );
        nuevoCliente.telefonos = nuevosTelefonos;
      }

      if (id_vendedorAsociado) {
        nuevoCliente.id_vendedorAsociado = id_vendedorAsociado;
        nuevoCliente.vendedorAsociadoHasta = vendedorAsociadoHasta;
      }

      if (id_cobradorAsociado) {
        nuevoCliente.id_cobradorAsociado = id_cobradorAsociado;
      }

      return await this.clientesRepository.save(nuevoCliente);
    } catch (error) {
      console.error(error);
      return `Error: ${error}`;
    }
  }

  async findAll(
    page: number,
    limit: number,
    filter: ClientesFilter,
  ): Promise<[Cliente[], number]> {
    const query = this.clientesRepository.createQueryBuilder('cliente');
    if (!filter.counterQuery) {
      query.leftJoinAndSelect('cliente.domicilios', 'domicilios');
      query.leftJoinAndSelect('cliente.telefonos', 'telefonos');
      query.leftJoinAndSelect('cliente.ventas', 'ventas');
      query.leftJoinAndSelect('ventas.financiacion', 'creditos');
      query.leftJoinAndSelect('cliente.zona', 'zona');
      if (limit > 0 && page > 0) query.skip((page - 1) * limit).take(limit);
    } else {
      query
        .select('cliente.estado, COUNT(cliente.id) as count')
        .groupBy('cliente.estado');
    }

    if (filter.searchTerm) {
      query.andWhere(
        '(cliente.id LIKE :cliente OR cliente.dni LIKE :cliente OR cliente.nombre LIKE :cliente OR cliente.apellido LIKE :cliente OR domicilios.direccion LIKE :cliente OR domicilios.barrio LIKE :cliente OR domicilios.localidad LIKE :cliente)',
        { cliente: `%${filter.searchTerm}%` },
      );
    }

    if (filter.domicilio) {
      query.andWhere(
        '(domicilios.direccion LIKE :cliente OR domicilios.barrio LIKE :cliente OR domicilios.localidad LIKE :cliente)',
        { cliente: `%${filter.domicilio}%` },
      );
    }

    if (filter.estado) {
      query.andWhere('(cliente.estado = :estado)', { estado: filter.estado });
    }

    if (filter.zona) {
      query.andWhere('(zona.nombre LIKE :zona)', { zona: `%${filter.zona}%` });
    }

    if (filter.apariciones) {
      query.andWhere('(ventas.comprobante LIKE :aparicion)', {
        aparicion: `%${filter.apariciones}%`,
      });
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
    return await this.clientesRepository.findOne({
      where: {
        id,
      },
      relations: {
        ventas: {
          productos: {
            producto: true,
          },
        },
      },
      withDeleted: true,
    });
  }

  async update(id: number, updateClienteDto: UpdateClienteDTO) {
    try {
      const cliente = await this.clientesRepository.findOneBy({ id });

      if (!cliente) return 'No existe el cliente con el ID ingresado';

      const {
        nombre,
        apellido,
        dni,
        fechaNacimiento,
        domicilios,
        telefonos,
        id_vendedorAsociado,
        vendedorAsociadoHasta,
        id_cobradorAsociado,
        saldo,
        observaciones,
        estado,
      } = updateClienteDto;

      if (nombre) cliente.nombre = nombre;
      cliente.apellido = apellido;
      if (dni) cliente.dni = dni;
      cliente.fechaNacimiento = new Date(fechaNacimiento.valueOf());
      if (saldo) cliente.saldo = saldo;
      cliente.observaciones = observaciones;
      if (estado) cliente.estado = estado;

      if (domicilios) {
        domicilios.map(async (domicilio: CreateDomicilioDTO) => {
          const nuevoDom = new DomicilioCliente();
          nuevoDom.direccion = domicilio.direccion;
          nuevoDom.barrio = domicilio.barrio;
          nuevoDom.localidad = domicilio.localidad;

          cliente.domicilios = [...(cliente.domicilios || []), nuevoDom];
          return;
        });
      }

      if (telefonos) {
        telefonos.map(async (telefono: CreateTelefonoDTO) => {
          const nuevoTel = new TelefonoCliente();
          nuevoTel.telefono = telefono.telefono;

          cliente.telefonos = [...(cliente.telefonos || []), nuevoTel];
          return;
        });
      }

      if (id_vendedorAsociado) {
        cliente.id_vendedorAsociado = id_vendedorAsociado;
        cliente.vendedorAsociadoHasta = vendedorAsociadoHasta;
      }

      if (id_cobradorAsociado) {
        cliente.id_cobradorAsociado = id_cobradorAsociado;
      }

      return await this.clientesRepository.save(cliente);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async softRemove(id: number) {
    try {
      const cliente = await this.clientesRepository.findOneBy({ id });
      if (!cliente) return 'No existe el cliente con el ID ingresado';

      return await this.clientesRepository.softRemove(cliente);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async remove(id: number) {
    try {
      const cliente = await this.clientesRepository.findOneBy({ id });
      if (!cliente) return 'No existe el cliente con el ID ingresado';

      for (const domicilio of cliente.domicilios) {
        await domicilio.remove();
      }

      for (const telefono of cliente.telefonos) {
        await telefono.remove();
      }

      return await this.clientesRepository.remove(cliente);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async restore(id: number) {
    try {
      const cliente = await this.clientesRepository.findOne({
        where: { id },
        withDeleted: true,
      });
      if (!cliente) return 'No existe el cliente con el ID ingresado';

      if (!cliente.deletedAt) return 'El cliente no está eliminado';

      return await this.clientesRepository.recover(cliente);
    } catch (error) {
      return `Error: ${error}`;
    }
  }
}
