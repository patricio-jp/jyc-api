import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/entities/clientes/clientes.entity';
import {
  CreateIngresoDTO,
  UpdateIngresoDTO,
} from 'src/entities/operaciones/ingresos.dto';
import { FormaPago, Ingreso } from 'src/entities/operaciones/ingresos.entity';
import { Recibo } from 'src/entities/recibos/recibos.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

interface IngresosFilter {
  fecha?: Date | string;
  cliente?: string;
  formaPago?: FormaPago;
  searchTerm?: string;
  mostrarEliminados?: boolean;
  counterQuery?: boolean;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

@Injectable()
export class IngresosService {
  constructor(
    @InjectRepository(Ingreso)
    private ingresosRepository: Repository<Ingreso>,
    @InjectRepository(Recibo)
    private recibosRepository: Repository<Recibo>,
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
  ) {}

  async create(createIngresoDto: CreateIngresoDTO) {
    try {
      const { cliente_id, fecha, concepto, importe, formaPago } =
        createIngresoDto;
      const ingreso = new Ingreso();

      const cliente = await this.clientesRepository.findOneBy({
        id: cliente_id,
      });
      if (!cliente) {
        return 'No existe el cliente con el ID ingresado';
      }

      const recibo = new Recibo();
      recibo.uuid = uuidv4();
      recibo.cliente = cliente;

      ingreso.fecha = fecha;
      ingreso.concepto = concepto;
      ingreso.importe = importe;
      ingreso.formaPago = formaPago;
      ingreso.recibo = recibo;

      await this.ingresosRepository.save(ingreso);
      return ingreso;
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async findAll(
    page: number,
    limit: number,
    filter: IngresosFilter,
  ): Promise<[Ingreso[], number]> {
    const query = this.ingresosRepository.createQueryBuilder('ingreso');
    const queryAux = this.ingresosRepository.createQueryBuilder('ingreso');
    //const queryAux2 = this.ingresosRepository.createQueryBuilder('ingreso');

    if (!filter.counterQuery) {
      query.leftJoinAndSelect('ingreso.recibo', 'recibo');
      query.leftJoinAndSelect('recibo.cliente', 'cliente');
      query.leftJoinAndSelect('cliente.domicilios', 'domicilios');
      query.leftJoinAndSelect('cliente.telefonos', 'telefonos');
      if (limit > 0 && page > 0) query.skip((page - 1) * limit).take(limit);
    } else {
      query
        .select('ingreso.formaPago, COUNT(ingreso.id) as count')
        .groupBy('ingreso.formaPago');

      queryAux
        .select(
          'CASE WHEN ingreso.deletedAt IS NULL THEN false ELSE true END as eliminado, COUNT(ingreso.id) as count',
        )
        .groupBy('eliminado')
        .withDeleted();
    }

    if (filter.formaPago) {
      query.andWhere('ingreso.formaPago = :formaPago', {
        formaPago: filter.formaPago,
      });
    }

    if (filter.cliente) {
      query.andWhere(
        '(cliente.id LIKE :cliente OR cliente.dni LIKE :cliente OR cliente.nombre LIKE :cliente OR cliente.apellido LIKE :cliente OR domicilios.direccion LIKE :cliente OR domicilios.barrio LIKE :cliente OR domicilios.localidad LIKE :cliente)',
        { cliente: `%${filter.cliente}%` },
      );
    }

    if (filter.searchTerm) {
      const querySearchClient =
        'cliente.nombre LIKE :searchTerm OR cliente.apellido LIKE :searchTerm OR cliente.dni LIKE :searchTerm OR domicilios.direccion LIKE :searchTerm OR domicilios.barrio LIKE :searchTerm OR domicilios.localidad LIKE :searchTerm OR telefonos.telefono LIKE :searchTerm';
      let searchQuery = 'recibo.uuid LIKE :searchTerm';
      if (!filter.cliente) {
        searchQuery = searchQuery + ' OR ' + querySearchClient;
      }
      query.andWhere(`(${searchQuery})`, {
        searchTerm: `%${filter.searchTerm}%`,
      });
    }

    if (filter.fecha) {
      const startOfMonth = new Date(filter.fecha);
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      query.andWhere('(ingreso.fecha BETWEEN :startOfMonth AND :endOfMonth)', {
        startOfMonth,
        endOfMonth,
      });
    }

    if (filter.mostrarEliminados) {
      query.withDeleted();
    }

    if (filter.orderBy) {
      if (filter.orderBy === 'cliente') {
        query.orderBy({
          'cliente.apellido': filter.orderDir.toUpperCase() as 'ASC' | 'DESC',
          'cliente.nombre': filter.orderDir.toUpperCase() as 'ASC' | 'DESC',
        });
      } else {
        const orderByField = `ingreso.${filter.orderBy}`;
        query.orderBy(
          orderByField,
          (filter.orderDir.toUpperCase() as 'ASC' | 'DESC') || 'DESC',
        );
      }
    } else if (!filter.counterQuery) {
      query.orderBy('ingreso.id', 'DESC');
    }

    if (filter.counterQuery) {
      const dataFormaPago = await query.execute();
      const dataEliminadosONo = await queryAux.execute();
      const data = [...dataFormaPago, ...dataEliminadosONo];
      let count = 0;
      dataFormaPago.forEach((element) => {
        count += Number(element.count);
      });
      return [data, count];
    }
    return await query.getManyAndCount();
  }

  async findOne(id: number) {
    return await this.ingresosRepository.findOne({
      where: { id },
      withDeleted: true,
    });
  }

  async findOneByUUID(uuid: string) {
    return await this.recibosRepository.findOne({
      where: { uuid },
      withDeleted: true,
    });
  }

  update(id: number, updateIngresoDto: UpdateIngresoDTO) {
    //const { cliente_id, fecha, concepto, importe } = updateIngresoDto;
    console.log(updateIngresoDto);
    return `This action updates a #${id} ingreso`;
  }

  async softRemove(id: number) {
    try {
      const ingreso = await this.ingresosRepository.findOneBy({ id });

      if (!ingreso) return 'No existe el ingreso con el ID ingresado';

      return await this.ingresosRepository.softRemove(ingreso);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async remove(id: number) {
    try {
      const ingreso = await this.ingresosRepository.findOneBy({ id });

      if (!ingreso) return 'No existe el ingreso con el ID ingresado';

      return await this.ingresosRepository.remove(ingreso);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async restore(id: number) {
    try {
      const ingreso = await this.ingresosRepository.findOne({
        where: { id },
        withDeleted: true,
      });

      if (!ingreso) return 'No existe el ingreso con el ID ingresado';

      if (!ingreso.deletedAt) return 'El ingreso no está eliminado';

      return await this.ingresosRepository.softRemove(ingreso);
    } catch (error) {
      return `Error: ${error}`;
    }
  }
}
