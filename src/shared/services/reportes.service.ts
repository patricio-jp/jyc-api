import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from 'src/entities/clientes/clientes.entity';
import { EstadoCredito } from 'src/entities/creditos/creditos.entity';

@Injectable()
export class ReportesService {
  constructor(
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
  ) {}

  /**
   * Devuelve una lista plana de clientes con sus créditos activos, ordenados por localidad, barrio y grupoCartones.
   * Para cada crédito, incluye el total a pagar en el mes (todas las cuotas del mes, pagadas o no).
   */
  async getClientesConCreditosActivosOrdenados(mes: number, anio: number) {
    const clientes = await this.clientesRepository.find({
      relations: {
        domicilios: true,
        telefonos: true,
        ventas: {
          financiacion: {
            cuotas: true,
            carton: {
              grupoCartones: true,
            },
          },
          productos: {
            producto: true,
          },
        },
      },
    });

    const resultado = clientes
      .map((cliente) => {
        // Buscar ventas con financiacion activa (asumimos campo 'activo' en financiacion)
        const creditosActivos = (cliente.ventas || [])
          .filter(
            (venta: any) =>
              venta.financiacion &&
              venta.financiacion.estado !== EstadoCredito.Anulado &&
              venta.financiacion.estado !== EstadoCredito.Pagado,
          )
          .map((venta: any) => {
            const financiacion = venta.financiacion.filter(
              (f: any) =>
                f.estado !== EstadoCredito.Anulado &&
                f.estado !== EstadoCredito.Pagado,
            )[0]; // Tomamos el primer crédito activo
            if (!financiacion) return undefined;
            const cuotas = financiacion.cuotas || [];
            // Cuotas del mes
            const cuotasDelMes = cuotas.filter((cuota: any) => {
              const fecha = new Date(cuota.fechaVencimiento);
              return (
                fecha.getMonth() + 1 === mes && fecha.getFullYear() === anio
              );
            });
            if (cuotasDelMes.length === 0) return undefined;
            const totalMes = cuotasDelMes.reduce(
              (sum: number, cuota: any) => sum + Number(cuota.montoCuota || 0),
              0,
            );
            return {
              id: financiacion.id,
              comprobante: venta.comprobante,
              fechaInicio: financiacion.fechaInicio,
              productos: (venta.productos || [])
                .map((p: any) => p.producto?.nombre)
                .filter(Boolean),
              cantidadCuotas: financiacion.cantidadCuotas || 0,
              periodo: financiacion.periodo,
              montoCuota: Number(financiacion.montoCuota || 0),
              grupoCartones: financiacion.carton?.grupoCartones,
              totalMes,
            };
          })
          .filter((c: any) => !!c); // Filtrar créditos sin cuotas del mes
        if (creditosActivos.length === 0) return undefined;
        return {
          id: cliente.id,
          apellido: cliente.apellido,
          nombre: cliente.nombre,
          telefonos: (cliente.telefonos || []).map((t: any) => t.telefono),
          domicilios: (cliente.domicilios || []).map((d: any) => ({
            direccion: d.direccion,
            barrio: d.barrio,
            localidad: d.localidad,
          })),
          creditos: creditosActivos,
          totalMes: creditosActivos.reduce(
            (sum: number, credito: any) => sum + credito.totalMes,
            0,
          ),
        };
      })
      .filter((c) => !!c);

    // Ordenar por localidad, barrio, grupoCartones
    resultado.sort((a, b) => {
      const domA = a.domicilios[0] || { localidad: '', barrio: '' };
      const domB = b.domicilios[0] || { localidad: '', barrio: '' };
      if (
        domA.localidad &&
        domB.localidad &&
        domA.localidad !== domB.localidad
      ) {
        return domA.localidad.localeCompare(domB.localidad);
      }
      if (domA.barrio && domB.barrio && domA.barrio !== domB.barrio) {
        return domA.barrio.localeCompare(domB.barrio);
      }
      // Agrupar por grupoCartones (primer crédito activo)
      const grupoA = a.creditos[0]?.grupoCartones?.id || 0;
      const grupoB = b.creditos[0]?.grupoCartones?.id || 0;
      return grupoA - grupoB;
    });

    return resultado;
  }
}
