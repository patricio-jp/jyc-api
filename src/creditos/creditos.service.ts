import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EstadoCarton } from 'src/entities/cartones/carton.entity';
import { CargarPagoDTO } from 'src/entities/creditos/creditos.dto';
import {
  Credito,
  EstadoCredito,
  Periodo,
} from 'src/entities/creditos/creditos.entity';
import { Cuota, EstadoCuota } from 'src/entities/cuotas/cuotas.entity';
import { EstadoOperacion } from 'src/entities/operaciones/operaciones.entity';
import { Repository } from 'typeorm';

interface CreditosFilter {
  estadoCredito?: EstadoCredito;
  periodo?: Periodo;
  estadoCarton?: EstadoCarton;
  fechaVencCuota?: Date;
  fechaUltimoPago?: Date;
  searchTerm?: string;
  mostrarEliminados?: boolean;
}

@Injectable()
export class CreditosService {
  constructor(
    @InjectRepository(Credito)
    private creditosRepository: Repository<Credito>,
  ) {}

  async findAll(page: number, limit: number, filter: CreditosFilter) {
    const query = this.creditosRepository.createQueryBuilder('credito');
    query.leftJoinAndSelect('credito.venta', 'venta');
    query.leftJoinAndSelect('credito.cuotas', 'cuotas');
    query.leftJoinAndSelect('credito.carton', 'carton');
    query.leftJoinAndSelect('carton.grupoCartones', 'grupoCartones');
    query.leftJoinAndSelect('venta.productos', 'detalle');
    query.leftJoinAndSelect('detalle.producto', 'productos');
    query.leftJoinAndSelect('venta.cliente', 'cliente');
    query.leftJoinAndSelect('cliente.domicilios', 'domicilios');
    query.leftJoinAndSelect('cliente.telefonos', 'telefonos');

    if (filter.estadoCredito) {
      query.andWhere('credito.estado = :estadoCredito', {
        estadoCredito: filter.estadoCredito,
      });
    }

    if (filter.periodo) {
      query.andWhere('credito.periodo = :periodo', {
        periodo: filter.periodo,
      });
    }

    if (filter.estadoCarton) {
      query.andWhere('carton.estado = :estadoCarton', {
        estadoCarton: filter.estadoCarton,
      });
    }

    if (filter.fechaVencCuota) {
      const fechaVencCuota = new Date(filter.fechaVencCuota)
        .toISOString()
        .split('T')[0];
      query.andWhere('cuotas.fechaVencimiento = :fechaVencCuota', {
        fechaVencCuota,
      });
    }

    if (filter.fechaUltimoPago) {
      const startOfMonth = new Date(filter.fechaUltimoPago);
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);
      query.andWhere('cuotas.fechaPago BETWEEN :startOfMonth AND :endOfMonth', {
        startOfMonth,
        endOfMonth,
      });
    }

    if (filter.searchTerm) {
      query.andWhere(
        '(cliente.nombre LIKE :searchTerm OR cliente.apellido LIKE :searchTerm OR cliente.dni LIKE :searchTerm OR venta.comprobante LIKE :searchTerm OR productos.nombre LIKE :searchTerm OR domicilios.direccion LIKE :searchTerm OR domicilios.barrio LIKE :searchTerm OR domicilios.localidad LIKE :searchTerm OR telefonos.telefono LIKE :searchTerm)',
        {
          searchTerm: `%${filter.searchTerm}%`,
        },
      );
    }

    if (filter.mostrarEliminados) {
      query.withDeleted();
    }

    query.skip((page - 1) * limit).take(limit);

    return await query.getManyAndCount();
  }

  async findOne(id: number) {
    return await Credito.obtenerCredito(id);
  }

  async getCreditosPorVencimiento(fecha: Date) {
    return await Cuota.obtenerVencimientosDelDia(fecha);
  }

  /* update(id: number, updateCreditoDto: UpdateCreditoDto) {
    return `This action updates a #${id} credito`;
  } */

  async cargarPago(id: number, pago: CargarPagoDTO) {
    try {
      const credito = await Credito.obtenerCredito(id);

      if (!credito) return 'No existe el crédito con el ID ingresado';

      let cuotaAPagar = credito.cuotas.find(
        (cuota) => cuota.montoPagado < cuota.montoCuota,
      );

      let montoAPagar = Number(pago.monto);

      while (montoAPagar > 0 && cuotaAPagar) {
        const saldoCuota =
          Number(cuotaAPagar.montoCuota) - Number(cuotaAPagar.montoPagado);

        if (montoAPagar >= saldoCuota) {
          cuotaAPagar.montoPagado =
            Number(cuotaAPagar.montoPagado) + saldoCuota;
          montoAPagar -= saldoCuota;
          if (cuotaAPagar.montoPagado == cuotaAPagar.montoCuota) {
            cuotaAPagar.estado = EstadoCuota.Pagada;
          }
        } else {
          cuotaAPagar.montoPagado =
            Number(cuotaAPagar.montoPagado) + montoAPagar;
          montoAPagar = 0;
          if (cuotaAPagar.montoPagado == cuotaAPagar.montoCuota) {
            cuotaAPagar.estado = EstadoCuota.Pagada;
          }
        }

        cuotaAPagar.fechaPago = pago.fechaPago ? pago.fechaPago : new Date();

        cuotaAPagar = credito.cuotas.find(
          (cuota) => cuota.cuotaNro === cuotaAPagar.cuotaNro + 1,
        );
      }

      credito.venta.cliente.saldo -= Number(pago.monto);
      if (montoAPagar > 0 && !cuotaAPagar) {
        // Asignar saldo pagado de más a la última cuota
        cuotaAPagar.montoPagado += montoAPagar;
        cuotaAPagar.cambiarEstado(
          EstadoCuota.Pagada,
          `Pagó de más ${montoAPagar}`,
        );
        cuotaAPagar.fechaPago = pago.fechaPago ? pago.fechaPago : new Date();
      }

      // Si todas las cuotas fueron pagadas, modificar el estado del crédito
      const todasCuotasPagadas = credito.cuotas.every(
        (cuota) => cuota.estado === EstadoCuota.Pagada,
      );
      if (todasCuotasPagadas) {
        credito.estado = EstadoCredito.Pagado;
        credito.venta.estado = EstadoOperacion.Pagado;
      }

      return await this.creditosRepository.save(credito);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async cambiarEstado(id: number, estado: EstadoCredito) {
    try {
      const credito = await this.creditosRepository.findOneBy({ id });

      if (!credito) return 'No existe el crédito con el ID ingresado';

      if (estado === EstadoCredito.Anulado) {
        return await credito.anularCredito();
      } else {
        credito.estado = estado;
        return await credito.save();
      }
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async softRemove(id: number) {
    return await this.creditosRepository.softDelete({ id });
  }

  async remove(id: number) {
    return await this.creditosRepository.delete({ id });
  }
}
