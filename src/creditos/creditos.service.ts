import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Carton, EstadoCarton } from 'src/entities/cartones/carton.entity';
import { CambiarEstadoCartonDTO } from 'src/entities/cartones/cartones.dto';
import { GrupoCartones } from 'src/entities/cartones/grupoCartones.entity';
import {
  CargarPagoDTO,
  UpdateCreditoDTO,
} from 'src/entities/creditos/creditos.dto';
import {
  Credito,
  CreditoUpdateTypes,
  EstadoCredito,
  Periodo,
} from 'src/entities/creditos/creditos.entity';
import { Cuota, EstadoCuota } from 'src/entities/cuotas/cuotas.entity';
import { CreateIngresoDTO } from 'src/entities/operaciones/ingresos.dto';
import { EstadoIngreso } from 'src/entities/operaciones/ingresos.entity';
import { EstadoOperacion } from 'src/entities/operaciones/operaciones.entity';
import { Venta } from 'src/entities/operaciones/ventas.entity';
import { FunctionsService } from 'src/helpers/functions/functions.service';
import { IngresosService } from 'src/ingresos/ingresos.service';
import { Repository } from 'typeorm';

interface CreditosFilter {
  estadoCredito?: EstadoCredito | EstadoCredito[];
  periodo?: Periodo;
  estadoCarton?: EstadoCarton;
  fechaVencCuota?: Date;
  fechaUltimoPago?: Date;
  searchTerm?: string;
  mostrarEliminados?: boolean;
  counterQuery?: boolean;
  orderBy?: string;
  orderDir?: 'asc' | 'desc';
}

@Injectable()
export class CreditosService {
  constructor(
    @InjectRepository(Credito)
    private creditosRepository: Repository<Credito>,
    @InjectRepository(Carton)
    private cartonesRepository: Repository<Carton>,
    @InjectRepository(GrupoCartones)
    private grupoCartonesRepository: Repository<GrupoCartones>,
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
    private functionsService: FunctionsService,
    private ingresosService: IngresosService,
  ) {}

  async findAll(page: number, limit: number, filter: CreditosFilter) {
    const query = this.creditosRepository.createQueryBuilder('credito');
    const queryAux1 = this.creditosRepository.createQueryBuilder('credito');
    const queryAux2 = this.creditosRepository.createQueryBuilder('credito');
    query.leftJoinAndSelect('credito.carton', 'carton');
    if (!filter.counterQuery) {
      query.leftJoinAndSelect('credito.venta', 'venta');
      query.leftJoinAndSelect('credito.cuotas', 'cuotas');
      query.leftJoinAndSelect('carton.grupoCartones', 'grupoCartones');
      query.leftJoinAndSelect('grupoCartones.cartones', 'cartonesEnGrupo');
      query.leftJoinAndSelect(
        'cartonesEnGrupo.credito',
        'creditoCartonesEnGrupo',
      );
      query.leftJoinAndSelect(
        'creditoCartonesEnGrupo.venta',
        'ventaCartonesEnGrupo',
      );
      query.leftJoinAndSelect('venta.productos', 'detalle');
      query.leftJoinAndSelect('detalle.producto', 'productos');
      query.leftJoinAndSelect('venta.cliente', 'cliente');
      query.leftJoinAndSelect('cliente.domicilios', 'domicilios');
      query.leftJoinAndSelect('cliente.telefonos', 'telefonos');
      if (limit > 0 && page > 0) query.skip((page - 1) * limit).take(limit);
    } else {
      query
        .select('carton.estado as estadoCarton, COUNT(credito.id) as count')
        .groupBy('carton.estado');
      queryAux2
        .select('credito.estado as estadoCredito, COUNT(credito.id) as count')
        .groupBy('credito.estado');
      queryAux1
        .select('credito.periodo, COUNT(credito.id) as count')
        .groupBy('credito.periodo');
    }

    if (filter.estadoCredito) {
      if (Array.isArray(filter.estadoCredito)) {
        query.andWhere('credito.estado IN (:...estadoCredito)', {
          estadoCredito: filter.estadoCredito,
        });
      } else {
        query.andWhere('credito.estado = :estadoCredito', {
          estadoCredito: filter.estadoCredito,
        });
      }
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

    if (filter.orderBy) {
      if (filter.orderBy === 'cliente') {
        query.orderBy({
          'cliente.apellido': filter.orderDir.toUpperCase() as 'ASC' | 'DESC',
          'cliente.nombre': filter.orderDir.toUpperCase() as 'ASC' | 'DESC',
        });
      } else if (filter.orderBy === 'credito') {
        const orderByField = `venta.comprobante`;
        query.orderBy(
          orderByField,
          (filter.orderDir.toUpperCase() as 'ASC' | 'DESC') || 'DESC',
        );
      } else {
        const orderByField = `credito.${filter.orderBy}`;
        query.orderBy(
          orderByField,
          (filter.orderDir.toUpperCase() as 'ASC' | 'DESC') || 'DESC',
        );
      }
    } else if (!filter.counterQuery) {
      query.orderBy('credito.id', 'DESC');
    }

    if (filter.counterQuery) {
      const dataEstadoCredito = await queryAux1.execute();
      const dataPeriodoCredito = await queryAux2.execute();
      const dataEstadosCartones = await query.execute();
      const data = [
        ...dataEstadoCredito,
        ...dataPeriodoCredito,
        ...dataEstadosCartones,
      ];
      let count = 0;
      dataEstadoCredito.forEach((element) => {
        count += Number(element.count);
      });
      return [data, count];
    }
    return await query.getManyAndCount();
  }

  async findOne(id: number) {
    return await Credito.obtenerCredito(id);
  }

  async getCreditosPorVencimiento(fecha: Date) {
    return await Cuota.obtenerVencimientosDelDia(fecha);
  }

  async update(id: number, updateCreditoDto: UpdateCreditoDTO) {
    try {
      const credito = await Credito.obtenerCredito(id);

      if (!credito) return 'No existe el crédito con el ID ingresado';

      const updateType: CreditoUpdateTypes =
        credito.compareWithDTO(updateCreditoDto);

      if (updateType === CreditoUpdateTypes.NonUpdate) {
        return 'No corresponde actualización';
      } else {
        if (updateType === CreditoUpdateTypes.Full) {
          // Full
          await credito.anularCredito();
          const {
            id_venta,
            id_grupoCartones,
            alias_grupoCartones,
            estadoCarton,
            fechaCarton,
            fechaUltimoPago,
            formaPagoAnticipo,
            fechaInicio,
            anticipo,
            cantidadCuotas,
            montoCuota,
            periodo,
            estado,
          } = updateCreditoDto;

          const ventaAsociadaAlCredito = await this.ventasRepository.findOneBy({
            id: id_venta,
          });

          if (!ventaAsociadaAlCredito)
            throw new BadRequestException('El ID de la venta es requerido');

          const nuevoCredito = new Credito();
          nuevoCredito.venta = ventaAsociadaAlCredito;
          nuevoCredito.fechaInicio = new Date(fechaInicio);
          nuevoCredito.cantidadCuotas = cantidadCuotas;
          nuevoCredito.montoCuota = montoCuota;
          nuevoCredito.periodo = periodo;
          if (anticipo && anticipo > 0) {
            nuevoCredito.anticipo = anticipo;
            // Generar recibo para el anticipo
            const infoRecibo: CreateIngresoDTO = {
              fecha: credito.venta.fecha,
              importe: Number(anticipo),
              formaPago: formaPagoAnticipo,
              concepto: 'Anticipo - Pago de cuota',
              cliente_id: credito.venta.cliente.id,
            };
            await this.ingresosService.create(infoRecibo);
          }
          if (estado) nuevoCredito.estado = estado;

          let fechaVenc = new Date(fechaInicio.valueOf());
          fechaVenc.setHours(fechaVenc.getHours() + 3);

          let anticipoRestante = anticipo;

          for (let numCuota = 1; numCuota <= cantidadCuotas; numCuota++) {
            const cuota = new Cuota();
            cuota.cuotaNro = numCuota;
            fechaVenc = new Date(fechaVenc.valueOf());

            if (numCuota !== 1) {
              switch (periodo) {
                case Periodo.Mensual: {
                  fechaVenc = this.functionsService.addMonth(fechaVenc);
                  if (
                    fechaVenc.getDate() < nuevoCredito.fechaInicio.getDate()
                  ) {
                    fechaVenc = this.functionsService.addMonth(fechaVenc);
                    fechaVenc.setDate(0); // Esto ajusta al último día del mes anterior
                    if (
                      fechaVenc.getDate() > nuevoCredito.fechaInicio.getDate()
                    ) {
                      fechaVenc.setDate(nuevoCredito.fechaInicio.getDate());
                    }
                  }
                  break;
                }
                case Periodo.Quincenal: {
                  fechaVenc.setDate(fechaVenc.getDate() + 15);
                  if (fechaVenc.getDay() === 0) {
                    fechaVenc.setDate(fechaVenc.getDate() + 1);
                  }
                  break;
                }
                case Periodo.Semanal: {
                  fechaVenc.setDate(fechaVenc.getDate() + 7);
                  break;
                }
                default: {
                  console.error(
                    'Error con el período de las cuotas. Período inválido',
                  );
                  break;
                }
              }
            }

            if (anticipoRestante > 0) {
              if (anticipoRestante >= montoCuota) {
                cuota.montoPagado = montoCuota;
                cuota.fechaPago = fechaInicio;
                cuota.estado = EstadoCuota.Pagada;
                anticipoRestante -= montoCuota;
              } else {
                cuota.montoPagado = anticipoRestante;
                cuota.fechaPago = fechaInicio;
                anticipoRestante = 0;
              }
              nuevoCredito.fechaUltimoPago = fechaUltimoPago;
            }

            cuota.fechaVencimiento = fechaVenc;
            cuota.montoCuota = montoCuota;
            nuevoCredito.cuotas = nuevoCredito.cuotas
              ? [...nuevoCredito.cuotas, cuota]
              : [cuota];
          }

          // Crear cartón
          const carton = new Carton();
          carton.estado = estadoCarton;
          carton.fechaCarton = new Date(fechaCarton);

          if (id_grupoCartones) {
            carton.grupoCartones = await this.grupoCartonesRepository.findOne({
              where: { id: id_grupoCartones },
            });
          } else {
            const nuevoGrupoCartones = new GrupoCartones();
            if (alias_grupoCartones) {
              nuevoGrupoCartones.alias = alias_grupoCartones;
            }
            await this.grupoCartonesRepository.save(nuevoGrupoCartones);
            carton.grupoCartones = nuevoGrupoCartones;
          }

          await this.cartonesRepository.save(carton);
          nuevoCredito.carton = carton;

          return await nuevoCredito.save();
        } else {
          // Parcial con actualizacion de cuotas
          const {
            anticipo,
            formaPagoAnticipo,
            uuidRecibo,
            estado,
            fechaInicio,
            periodo,
            fechaUltimoPago,
            montoCuota,
          } = updateCreditoDto;

          // Actualizar estado si corresponde
          if (credito.estado !== estado) credito.estado = estado;

          // Actualizar fecha de último pago si corresponde
          if (fechaUltimoPago) {
            const fechaUltPago = new Date(fechaUltimoPago);
            const timeUltimoPago = fechaUltPago.getTime();
            const timeCreditoUltPago = credito.fechaUltimoPago.getTime();
            if (timeCreditoUltPago !== timeUltimoPago)
              credito.fechaUltimoPago = fechaUltPago;
          }

          // Actualizar monto de cuotas si corresponde
          if (credito.montoCuota !== montoCuota) {
            credito.montoCuota = montoCuota;
            credito.cuotas.forEach((cuota) => {
              cuota.montoCuota = montoCuota;
            });
          }

          // Actualizar info de anticipo si corresponde
          if (credito.anticipo !== anticipo) {
            credito.anticipo = anticipo;
            // Eliminar recibo anterior
            const ingreso = (
              await this.ingresosService.findOneByUUID(uuidRecibo)
            ).Ingreso;
            await ingreso.softRemove();

            // Crear nuevo recibo
            const infoRecibo: CreateIngresoDTO = {
              fecha: credito.venta.fecha,
              importe: Number(anticipo),
              formaPago: formaPagoAnticipo,
              concepto: 'Anticipo - Pago de cuota',
              cliente_id: credito.venta.cliente.id,
            };
            await this.ingresosService.create(infoRecibo);
          }

          // Actualizar fechaInicio y vencimiento de cuotas si corresponde
          const fechaInicioNueva = new Date(fechaInicio);
          const timeInicioRegistrado = credito.fechaInicio.getTime();
          const timeInicioNuevo = fechaInicioNueva.getTime();
          if (timeInicioRegistrado !== timeInicioNuevo) {
            let fechaVenc = new Date(fechaInicio.valueOf());
            fechaVenc.setHours(fechaVenc.getHours() + 3);

            credito.cuotas.forEach((cuota) => {
              fechaVenc = new Date(fechaVenc.valueOf());

              if (cuota.cuotaNro !== 1) {
                switch (periodo) {
                  case Periodo.Mensual: {
                    fechaVenc = this.functionsService.addMonth(fechaVenc);
                    if (fechaVenc.getDate() < fechaInicioNueva.getDate()) {
                      fechaVenc = this.functionsService.addMonth(fechaVenc);
                      fechaVenc.setDate(0); // Esto ajusta al último día del mes anterior
                      if (fechaVenc.getDate() > fechaInicioNueva.getDate()) {
                        fechaVenc.setDate(fechaInicioNueva.getDate());
                      }
                    }
                    break;
                  }
                  case Periodo.Quincenal: {
                    fechaVenc.setDate(fechaVenc.getDate() + 15);
                    if (fechaVenc.getDay() === 0) {
                      fechaVenc.setDate(fechaVenc.getDate() + 1);
                    }
                    break;
                  }
                  case Periodo.Semanal: {
                    fechaVenc.setDate(fechaVenc.getDate() + 7);
                    break;
                  }
                  default: {
                    console.error(
                      'Error con el período de las cuotas. Período inválido',
                    );
                    break;
                  }
                }
              }

              cuota.fechaVencimiento = fechaVenc;
            });
          }
        }
      }
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async cargarPago(id: number, pago: CargarPagoDTO) {
    try {
      const credito = await Credito.obtenerCredito(id);

      if (!credito) return 'No existe el crédito con el ID ingresado';

      let cuotaAPagar = credito.cuotas.find(
        (cuota) => Number(cuota.montoPagado) < Number(cuota.montoCuota),
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

        cuotaAPagar.fechaPago = pago.fechaPago
          ? new Date(pago.fechaPago)
          : new Date();

        cuotaAPagar = credito.cuotas.find(
          (cuota) => cuota.cuotaNro === cuotaAPagar.cuotaNro + 1,
        );
      }

      // Actualizar fecha de último pago en el crédito
      credito.fechaUltimoPago = pago.fechaPago ? pago.fechaPago : new Date();

      // Actualizar fecha de último pago en el crédito
      credito.fechaUltimoPago = pago.fechaPago
        ? new Date(pago.fechaPago)
        : new Date();

      credito.venta.cliente.saldo -= Number(pago.monto);
      if (montoAPagar > 0 && !cuotaAPagar) {
        // Asignar saldo pagado de más a la última cuota
        cuotaAPagar.montoPagado += montoAPagar;
        cuotaAPagar.cambiarEstado(
          EstadoCuota.Pagada,
          `Pagó de más ${montoAPagar}`,
        );
        cuotaAPagar.fechaPago = pago.fechaPago
          ? new Date(pago.fechaPago)
          : new Date();
      }

      // Si todas las cuotas fueron pagadas, modificar el estado del crédito
      const todasCuotasPagadas = credito.cuotas.every(
        (cuota) => cuota.estado === EstadoCuota.Pagada,
      );
      if (todasCuotasPagadas) {
        credito.estado = EstadoCredito.Pagado;
        credito.venta.estado = EstadoOperacion.Pagado;
      }

      // Generar recibo o sumar el importe a uno ya existente
      const infoRecibo: CreateIngresoDTO = {
        fecha: pago.fechaPago ? new Date(pago.fechaPago) : new Date(),
        importe: Number(pago.monto),
        formaPago: pago.formaPago,
        estado: EstadoIngreso.Pendiente,
        concepto: 'Pago de cuota',
        cliente_id: credito.venta.cliente.id,
      };

      const ingresoExistente =
        await this.ingresosService.findPendienteByCliente(
          credito.venta.cliente.id,
        );

      await this.creditosRepository.save(credito);
      if (ingresoExistente) {
        ingresoExistente.importe =
          Number(ingresoExistente.importe) + Number(pago.monto);
        return await this.ingresosService.update(
          ingresoExistente.id,
          ingresoExistente,
          true,
        );
      }
      return await this.ingresosService.create(infoRecibo);
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

  async cambiarEstadoCarton(id: number, estadoCarton: CambiarEstadoCartonDTO) {
    try {
      const credito = await this.creditosRepository.findOne({
        where: { id },
        relations: {
          carton: {
            grupoCartones: {
              cartones: true,
            },
          },
          venta: true,
        },
      });

      if (!credito) return 'No existe el crédito con el ID ingresado';

      //return credito;
      const { estado, fechaCarton, actualizarGrupo } = estadoCarton;

      if (actualizarGrupo) {
        const grupoCartones = credito.carton.grupoCartones;
        grupoCartones.cartones.forEach((carton) => {
          carton.estado = estado;
          carton.fechaCarton = fechaCarton ? fechaCarton : new Date();
        });

        return await this.cartonesRepository.save(grupoCartones.cartones);
      } else {
        credito.carton.estado = estado;
        credito.carton.fechaCarton = fechaCarton ? fechaCarton : new Date();

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
