import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CargarPagoDTO } from 'src/entities/creditos/creditos.dto';
import { Credito, EstadoCredito } from 'src/entities/creditos/creditos.entity';
import { Cuota, EstadoCuota } from 'src/entities/cuotas/cuotas.entity';
import { EstadoOperacion } from 'src/entities/operaciones/operaciones.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CreditosService {
  constructor(
    @InjectRepository(Credito)
    private creditosRepository: Repository<Credito>,
  ) {}

  async findAll() {
    return await this.creditosRepository.findAndCount({
      relations: {
        venta: {
          productos: true,
        },
        cuotas: true,
      },
    });
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
