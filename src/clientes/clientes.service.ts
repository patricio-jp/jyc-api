import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateClienteDTO,
  UpdateClienteDTO,
} from 'src/entities/clientes/clientes.dto';
import { Repository } from 'typeorm';
import { Cliente, EstadoCliente } from 'src/entities/clientes/clientes.entity';
import { DomicilioCliente } from 'src/entities/domicilios/domicilios.entity';
import { TelefonoCliente } from 'src/entities/telefonos/telefonos.entity';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DomiciliosService } from 'src/shared/services/domicilios.service';
import { TelefonosService } from 'src/shared/services/telefonos.service';

interface ClientesFilter {
  counterQuery?: boolean;
  searchTerm?: string; // Usado para campos simples de la entidad
  domicilio?: string;
  estado?: EstadoCliente;
  zona?: string;
  apariciones?: string;
  mostrarEliminados?: boolean;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
    private domiciliosService: DomiciliosService,
    private telefonosService: TelefonosService,
  ) {}

  async create(createClienteDto: CreateClienteDTO) {
    const {
      dni,
      fechaNacimiento,
      domicilios,
      telefonos,
      id_vendedorAsociado,
      vendedorAsociadoHasta,
      id_cobradorAsociado,
      saldo,
      estado,
    } = createClienteDto;

    const existent = await this.clientesRepository.findOneBy({
      dni,
    });
    if (existent) {
      throw new BadRequestException(
        'El DNI ingresado no es válido o ya existe un cliente con ese DNI',
      );
    }

    const nuevoCliente = this.clientesRepository.create(createClienteDto);
    nuevoCliente.fechaNacimiento = fechaNacimiento
      ? new Date(fechaNacimiento.valueOf())
      : null;
    nuevoCliente.saldo = saldo ? saldo : 0;
    nuevoCliente.estado = estado ? estado : EstadoCliente.AConfirmar;

    await nuevoCliente.save();

    if (domicilios) {
      nuevoCliente.domicilios = await this.domiciliosService.createDomicilios(
        domicilios,
        'cliente',
      );
    }

    if (telefonos) {
      nuevoCliente.telefonos = await this.telefonosService.createTelefonos(
        telefonos,
        'cliente',
      );
    }

    if (id_vendedorAsociado) {
      const vendedorAsociado = await this.usuariosRepository.findOneBy({
        id: id_vendedorAsociado,
      });
      if (vendedorAsociado) {
        nuevoCliente.vendedorAsociado = vendedorAsociado;
        nuevoCliente.vendedorAsociadoHasta = vendedorAsociadoHasta;
      }
    }

    if (id_cobradorAsociado) {
      const cobradorAsociado = await this.usuariosRepository.findOneBy({
        id: id_cobradorAsociado,
      });
      if (cobradorAsociado) nuevoCliente.cobradorAsociado = cobradorAsociado;
    }

    return await this.clientesRepository.save(nuevoCliente);
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
      query.leftJoinAndSelect('creditos.carton', 'carton');
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

    if (filter.orderBy) {
      if (filter.orderBy === 'nombre') {
        query.orderBy({
          'cliente.apellido': filter.orderDir.toUpperCase() as 'ASC' | 'DESC',
          'cliente.nombre': filter.orderDir.toUpperCase() as 'ASC' | 'DESC',
        });
      } else if (
        filter.orderBy === 'barrio' ||
        filter.orderBy === 'localidad'
      ) {
        const orderByField = `domicilios.${filter.orderBy}`;
        query.orderBy(
          orderByField,
          (filter.orderDir.toUpperCase() as 'ASC' | 'DESC') || 'DESC',
        );
      } else {
        const orderByField = `cliente.${filter.orderBy}`;
        query.orderBy(
          orderByField,
          (filter.orderDir.toUpperCase() as 'ASC' | 'DESC') || 'DESC',
        );
      }
    } else if (!filter.counterQuery) {
      query.orderBy('cliente.id', 'ASC');
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

  async findAllByCartonGroup(
    groupId: number,
    page: number,
    limit: number,
  ): Promise<[Cliente[], number]> {
    const query = this.clientesRepository
      .createQueryBuilder('cliente')
      .leftJoinAndSelect('cliente.domicilios', 'domicilios')
      .leftJoinAndSelect('cliente.telefonos', 'telefonos')
      .leftJoinAndSelect('cliente.ventas', 'ventas')
      .leftJoinAndSelect('ventas.financiacion', 'creditos')
      .leftJoinAndSelect('creditos.carton', 'carton')
      .leftJoinAndSelect('carton.grupoCartones', 'grupoCartones')
      .where('grupoCartones.id = :groupId', { groupId });

    if (limit > 0 && page > 0) {
      query.skip((page - 1) * limit).take(limit);
    }

    return await query.getManyAndCount();
  }

  async findOne(id: number) {
    const client = await this.clientesRepository.findOne({
      where: {
        id,
      },
      relations: {
        ventas: {
          productos: {
            producto: true,
          },
          financiacion: {
            cuotas: true,
            carton: {
              grupoCartones: true,
            },
          },
        },
      },
      withDeleted: true,
    });

    if (!client) throw new NotFoundException('Cliente no encontrado');
    return client;
  }

  async update(id: number, updateClienteDto: UpdateClienteDTO) {
    const cliente = await this.clientesRepository.findOne({
      where: { id },
      relations: {
        domicilios: true,
        telefonos: true,
        vendedorAsociado: true,
        cobradorAsociado: true,
      },
      withDeleted: true,
    });

    if (!cliente)
      throw new NotFoundException('No existe el cliente con el ID ingresado');

    const {
      domicilios,
      telefonos,
      id_vendedorAsociado,
      vendedorAsociadoHasta,
      id_cobradorAsociado,
    } = updateClienteDto;

    if (domicilios) {
      cliente.domicilios = await this.domiciliosService.updateDomicilios(
        (cliente.domicilios as DomicilioCliente[]) || [],
        domicilios,
        'cliente',
      );
    }

    if (telefonos) {
      cliente.telefonos = await this.telefonosService.updateTelefonos(
        (cliente.telefonos as TelefonoCliente[]) || [],
        telefonos,
        'cliente',
      );
    }

    if (id_vendedorAsociado) {
      const vendedorAsociado = await this.usuariosRepository.findOneBy({
        id: id_vendedorAsociado,
      });
      if (vendedorAsociado) {
        cliente.vendedorAsociado = vendedorAsociado;
        cliente.vendedorAsociadoHasta = vendedorAsociadoHasta;
      }
    }

    if (id_cobradorAsociado) {
      const cobradorAsociado = await this.usuariosRepository.findOneBy({
        id: id_cobradorAsociado,
      });
      if (cobradorAsociado) cliente.cobradorAsociado = cobradorAsociado;
    }

    // Elimina domicilios y telefonos del DTO antes del merge
    const { domicilios: _, telefonos: __, ...restDto } = updateClienteDto;
    this.clientesRepository.merge(cliente, restDto);

    return await this.clientesRepository.save(cliente);
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
