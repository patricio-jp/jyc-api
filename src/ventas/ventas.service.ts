import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as fs from 'fs';
import { Credito, Periodo } from 'src/entities/creditos/creditos.entity';
import { Cuota, EstadoCuota } from 'src/entities/cuotas/cuotas.entity';
import {
  CondicionOperacion,
  EstadoOperacion,
} from 'src/entities/operaciones/operaciones.entity';
import { CreateVentaDTO } from 'src/entities/operaciones/ventas.dto';
import { DetalleVenta, Venta } from 'src/entities/operaciones/ventas.entity';
import { Repository } from 'typeorm';
/* import * as fs from 'fs';
import * as path from 'path'; */
//import { Inventario } from 'src/entities/inventario/inventario.entity';
import { Producto } from 'src/entities/productos/productos.entity';
import { Cliente } from 'src/entities/clientes/clientes.entity';
import { FunctionsService } from 'src/helpers/functions/functions.service';
import { Carton, EstadoCarton } from 'src/entities/cartones/carton.entity';
import { GrupoCartones } from 'src/entities/cartones/grupoCartones.entity';

interface VentasFilter {
  cliente?: string;
  fecha?: Date | string;
  estado?: EstadoOperacion;
  condicion?: CondicionOperacion;
  productos?: string;
  searchTerm?: string;
  mostrarEliminados?: boolean;
  counterQuery?: boolean;
}

@Injectable()
export class VentasService {
  constructor(
    @InjectRepository(Venta)
    private ventasRepository: Repository<Venta>,
    @InjectRepository(GrupoCartones)
    private grupoCartonesRepository: Repository<GrupoCartones>,
    @InjectRepository(Carton)
    private cartonesRepository: Repository<Carton>,
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
    private functionsService: FunctionsService,
  ) {}

  async create(createVentaDto: CreateVentaDTO) {
    try {
      const {
        fecha,
        comprobante,
        comprobante_url,
        subtotal,
        descuento,
        total,
        condicion,
        observaciones,
        estado,
        fechaEntrega,
        cliente_id,
        productos,
        financiacion,
      } = createVentaDto;

      const nuevaVenta = new Venta();
      nuevaVenta.fecha = fecha;
      nuevaVenta.comprobante = comprobante;
      nuevaVenta.comprobanteUrl = comprobante_url;
      nuevaVenta.subtotal = subtotal ? subtotal : total;
      if (descuento) nuevaVenta.descuento = descuento;
      nuevaVenta.total = total;
      nuevaVenta.condicion = condicion;
      nuevaVenta.observaciones = observaciones;
      if (estado) nuevaVenta.estado = estado;
      nuevaVenta.fechaEntrega = fechaEntrega;

      const cliente = await this.clientesRepository.findOne({
        where: { id: cliente_id },
      });
      if (cliente) nuevaVenta.cliente = cliente;

      const nuevoDetalle = [];
      for (const prod of productos) {
        const detalle = new DetalleVenta();

        const productoDetalle = await this.productosRepository.findOne({
          where: { id: prod.id_producto },
        });
        if (productoDetalle) {
          detalle.producto = productoDetalle;
        }

        detalle.cantidad = prod.cantidad;
        detalle.precioUnitario = prod.precioUnitario;

        /* const productoEnInventario = await this.inventarioRepository.findOne({
          where: { producto: { id: prod.producto_id } },
          relations: { producto: true },
        });
        if (productoEnInventario) {
          productoEnInventario.stock -= prod.cantidad;
          await this.inventarioRepository.save(productoEnInventario);
        } */
        productoDetalle.stock -= prod.cantidad;
        await this.productosRepository.save(productoDetalle);

        nuevoDetalle.push(detalle);
      }
      nuevaVenta.productos = nuevoDetalle;

      if (condicion === CondicionOperacion.CTA_CTE && financiacion) {
        const {
          fechaInicio,
          anticipo,
          cantidadCuotas,
          montoCuota,
          periodo,
          estado,
        } = financiacion;

        const cliente = await this.clientesRepository.findOne({
          where: { id: cliente_id },
        });
        if (cliente) {
          if (anticipo > 0) {
            const saldoActual = Number(cliente.saldo);
            const nuevoSaldo =
              saldoActual +
              Number(cantidadCuotas) * Number(montoCuota) -
              Number(anticipo);
            cliente.saldo = nuevoSaldo;
          } else {
            cliente.saldo = Number(cliente.saldo) + Number(nuevaVenta.total);
          }
          await this.clientesRepository.save(cliente);
        }

        const nuevaFinanciacion = new Credito();
        nuevaFinanciacion.fechaInicio = new Date(fechaInicio);
        if (anticipo) nuevaFinanciacion.anticipo = anticipo;
        nuevaFinanciacion.cantidadCuotas = cantidadCuotas;
        nuevaFinanciacion.montoCuota = montoCuota;
        nuevaFinanciacion.periodo = periodo;
        if (estado) nuevaFinanciacion.estado = estado;

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
                  fechaVenc.getDate() < nuevaFinanciacion.fechaInicio.getDate()
                ) {
                  fechaVenc = this.functionsService.addMonth(fechaVenc);
                  fechaVenc.setDate(0); // Esto ajusta al último día del mes anterior
                  if (
                    fechaVenc.getDate() >
                    nuevaFinanciacion.fechaInicio.getDate()
                  ) {
                    fechaVenc.setDate(nuevaFinanciacion.fechaInicio.getDate());
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
            nuevaFinanciacion.fechaUltimoPago = fechaInicio;
          }

          cuota.fechaVencimiento = fechaVenc;
          cuota.montoCuota = montoCuota;
          nuevaFinanciacion.cuotas = nuevaFinanciacion.cuotas
            ? [...nuevaFinanciacion.cuotas, cuota]
            : [cuota];
        }

        nuevaVenta.financiacion = [nuevaFinanciacion];

        // Crear cartón
        const carton = new Carton();
        carton.estado = EstadoCarton.Pendiente;
        carton.fechaCarton = new Date();

        if (financiacion.id_grupoCartones) {
          carton.grupoCartones = await this.grupoCartonesRepository.findOne({
            where: { id: financiacion.id_grupoCartones },
          });
        } else {
          const nuevoGrupoCartones = new GrupoCartones();
          if (financiacion.alias_grupoCartones) {
            nuevoGrupoCartones.alias = financiacion.alias_grupoCartones;
          }
          await this.grupoCartonesRepository.save(nuevoGrupoCartones);
          carton.grupoCartones = nuevoGrupoCartones;
        }

        await this.cartonesRepository.save(carton);
        nuevaFinanciacion.carton = carton;
      }

      return await this.ventasRepository.save(nuevaVenta);
    } catch (error) {
      throw new InternalServerErrorException(`${error}`);
    }
  }

  async findAll(
    page: number,
    limit: number,
    filter: VentasFilter,
  ): Promise<[Venta[], number]> {
    const query = this.ventasRepository.createQueryBuilder('venta');
    const queryAux = this.ventasRepository.createQueryBuilder('venta');
    if (!filter.counterQuery) {
      query.leftJoinAndSelect('venta.cliente', 'cliente');
      query.leftJoinAndSelect('cliente.domicilios', 'domicilios');
      query.leftJoinAndSelect('venta.productos', 'detalleVenta');
      query.leftJoinAndSelect('detalleVenta.producto', 'producto');
      query.leftJoinAndSelect('venta.financiacion', 'credito');
      query.leftJoinAndSelect('credito.cuotas', 'cuota');
      if (limit > 0 && page > 0) query.skip((page - 1) * limit).take(limit);
    } else {
      query
        .select('venta.estado, COUNT(venta.id) as count')
        .groupBy('venta.estado');
      queryAux
        .select('venta.condicion, COUNT(venta.id) as count')
        .groupBy('venta.condicion');
    }

    if (filter.searchTerm) {
      query.andWhere('(venta.comprobante LIKE :search)', {
        search: `%${filter.searchTerm}%`,
      });
    }

    if (filter.cliente) {
      query.andWhere(
        '(cliente.id LIKE :cliente OR cliente.dni LIKE :cliente OR cliente.nombre LIKE :cliente OR cliente.apellido LIKE :cliente OR domicilios.direccion LIKE :cliente OR domicilios.barrio LIKE :cliente OR domicilios.localidad LIKE :cliente)',
        { cliente: `%${filter.cliente}%` },
      );
    }

    if (filter.fecha) {
      const startOfMonth = new Date(filter.fecha);
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const endOfMonth = new Date(startOfMonth);
      endOfMonth.setMonth(endOfMonth.getMonth() + 1);
      endOfMonth.setDate(0);
      endOfMonth.setHours(23, 59, 59, 999);

      query.andWhere('(venta.fecha BETWEEN :startOfMonth AND :endOfMonth)', {
        startOfMonth,
        endOfMonth,
      });
    }

    if (filter.estado) {
      query.andWhere('(venta.estado = :estado)', { estado: filter.estado });
    }

    if (filter.condicion) {
      const condicion = filter.condicion.replace('_', ' ');
      query.andWhere('(venta.condicion = :condicion)', {
        condicion: condicion,
      });
    }

    if (filter.productos) {
      query.andWhere(
        'venta.id IN (SELECT ventas.id FROM ventas INNER JOIN detalle_ventas ON ventas.id = detalle_ventas.ventaId INNER JOIN productos ON detalle_ventas.productoId = productos.id WHERE productos.nombre LIKE :productos OR productos.codigo LIKE :productos)',
        { productos: `%${filter.productos}%` },
      );
    }

    if (filter.mostrarEliminados) {
      query.withDeleted();
    }

    if (filter.counterQuery) {
      const dataEstados = await query.execute();
      const dataCondicion = await queryAux.execute();
      const data = [...dataEstados, ...dataCondicion];
      let count = 0;
      dataEstados.forEach((element) => {
        count += Number(element.count);
      });
      return [data, count];
    }
    return await query.getManyAndCount();
  }

  async findOne(id: number) {
    return await this.ventasRepository.findOneBy({ id });
  }

  async update(id: number, updateVentaDto: CreateVentaDTO) {
    try {
      const venta = await this.ventasRepository.findOneBy({ id });
      if (!venta) return 'No existe la venta con el ID ingresado';

      const {
        fecha,
        comprobante,
        comprobante_url,
        subtotal,
        descuento,
        total,
        condicion,
        observaciones,
        estado,
        fechaEntrega,
        cliente_id,
        productos: nuevosProductos,
        financiacion,
      } = updateVentaDto;

      venta.fecha = fecha;
      if (comprobante && comprobante_url) {
        /* const oldFilePath = path.join(
          __dirname,
          '..',
          'uploads',
          path.basename(venta.comprobanteUrl),
        );
        // Eliminar el archivo antiguo
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        } */

        // Asignar nuevos valores
        venta.comprobante = comprobante;
        venta.comprobanteUrl = comprobante_url;
      }
      venta.subtotal = subtotal;
      venta.descuento = descuento;
      venta.total = total;
      venta.observaciones = observaciones;
      venta.estado = estado;
      venta.fechaEntrega = fechaEntrega;
      venta.clienteId = cliente_id;

      if (condicion === CondicionOperacion.CTA_CTE && financiacion) {
        // Si se envía una financiación, se anula la existente directamente y se crea una nueva
        const {
          fechaInicio,
          anticipo,
          cantidadCuotas,
          montoCuota,
          periodo,
          estado,
        } = financiacion;

        const creditoActual = venta.financiacion.at(-1);

        // Anular actual y crear nuevo
        await creditoActual.anularCredito();
        const nuevaFinanciacion = new Credito();

        nuevaFinanciacion.fechaInicio = new Date(fechaInicio);
        nuevaFinanciacion.anticipo = anticipo;
        nuevaFinanciacion.cantidadCuotas = cantidadCuotas;
        nuevaFinanciacion.montoCuota = montoCuota;
        nuevaFinanciacion.estado = estado;

        let fechaVenc = new Date(fechaInicio.valueOf());
        fechaVenc.setHours(fechaVenc.getHours() + 3);

        for (let numCuota = 1; numCuota <= cantidadCuotas; numCuota++) {
          const cuota = new Cuota();
          cuota.cuotaNro = numCuota;
          fechaVenc = new Date(fechaVenc.valueOf());

          if (numCuota !== 1) {
            switch (periodo) {
              case Periodo.Mensual: {
                fechaVenc = this.functionsService.addMonth(fechaVenc);
                if (
                  fechaVenc.getDate() < nuevaFinanciacion.fechaInicio.getDate()
                ) {
                  fechaVenc = this.functionsService.addMonth(fechaVenc);
                  fechaVenc.setDate(0); // Esto ajusta al último día del mes anterior
                  if (
                    fechaVenc.getDate() >
                    nuevaFinanciacion.fechaInicio.getDate()
                  ) {
                    fechaVenc.setDate(nuevaFinanciacion.fechaInicio.getDate());
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
          cuota.montoCuota = montoCuota;
          nuevaFinanciacion.cuotas = nuevaFinanciacion.cuotas
            ? [...nuevaFinanciacion.cuotas, cuota]
            : [cuota];
        }

        venta.financiacion = [...venta.financiacion, nuevaFinanciacion];
      } else if (
        condicion === CondicionOperacion.CONTADO &&
        venta.condicion === CondicionOperacion.CTA_CTE
      ) {
        const creditoActual = venta.financiacion.at(-1);

        // Anular actual y crear nuevo
        await creditoActual.anularCredito();
      }

      venta.condicion = condicion;

      if (nuevosProductos) {
        // Mapa para acceso rápido a productos por ID
        const productosActualesMap = new Map(
          venta.productos.map((prod) => [prod.id_producto, prod]),
        );

        // Preparar listas de productos para actualizar, agregar y eliminar
        const productosParaActualizar = [];
        const productosParaAgregar = [];
        const idsNuevosProductos = nuevosProductos.map(
          (prod) => prod.id_producto,
        );

        // Determinar productos para actualizar o agregar
        nuevosProductos.forEach((nuevoProd) => {
          if (productosActualesMap.has(nuevoProd.id_producto)) {
            productosParaActualizar.push(nuevoProd);
          } else {
            productosParaAgregar.push(nuevoProd);
          }
        });

        // Determinar productos para eliminar
        const productosParaEliminar = venta.productos.filter(
          (prod) => !idsNuevosProductos.includes(prod.id_producto),
        );

        // Procesar actualizaciones
        productosParaActualizar.forEach(async (prod) => {
          const prodActual = productosActualesMap.get(prod.id_producto);
          prodActual.cantidad = prod.cantidad;
          prodActual.precioUnitario = prod.precioUnitario;

          // Diferencial para stock
          const dif = prodActual.cantidad - prod.cantidad;

          // Actualizar stock
          /* const inventario = await this.inventarioRepository.findOne({
            where: { id: prod },
          });
          if (inventario) {
            inventario.stock += dif;
            await this.inventarioRepository.save(inventario);
          } */

          const productoDetalle = await this.productosRepository.findOne({
            where: { id: prod.id_producto },
          });
          productoDetalle.stock += dif;
          await this.productosRepository.save(productoDetalle);
        });

        // Procesar adiciones
        productosParaAgregar.forEach(async (prod) => {
          const nuevoDetalle = new DetalleVenta();
          nuevoDetalle.id_producto = prod.id_producto;
          nuevoDetalle.cantidad = prod.cantidad;
          nuevoDetalle.precioUnitario = prod.precioUnitario;
          venta.productos = [...venta.productos, nuevoDetalle];

          // Actualizar stock
          /* const inventario = await this.inventarioRepository.findOneBy({
            id_producto: prod.id_producto,
          });

          inventario.stock -= prod.cantidad;
          await this.inventarioRepository.save(inventario); */
          const productoDetalle = await this.productosRepository.findOne({
            where: { id: prod.id_producto },
          });
          productoDetalle.stock -= prod.cantidad;
          await this.productosRepository.save(productoDetalle);
        });

        // Procesar eliminaciones
        productosParaEliminar.forEach(async (prod) => {
          venta.productos = venta.productos.filter(
            (p) => p.id_producto !== prod.id_producto,
          );

          // Actualizar stock
          /* const inventario = await this.inventarioRepository.findOneBy({
            id_producto: prod.id_producto,
          });

          inventario.stock += prod.cantidad;
          await this.inventarioRepository.save(inventario); */
          const productoDetalle = await this.productosRepository.findOne({
            where: { id: prod.id_producto },
          });
          productoDetalle.stock += prod.cantidad;
          await this.productosRepository.save(productoDetalle);
        });
      }

      // Guardar los cambios en la base de datos
      await this.ventasRepository.save(venta);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async softRemove(id: number) {
    return await this.ventasRepository.softDelete({ id });
  }

  async remove(id: number) {
    return await this.ventasRepository.delete({ id });
  }

  async cargarVentasDesdeArchivo(filePath: string) {
    try {
      const data = fs.readFileSync(filePath, 'utf8');
      const ventas: CreateVentaDTO[] = JSON.parse(data);

      for (const venta of ventas) {
        await this.create(venta);
      }

      return 'Ventas cargadas exitosamente';
    } catch (error) {
      return `Error al cargar ventas: ${error}`;
    }
  }
}
