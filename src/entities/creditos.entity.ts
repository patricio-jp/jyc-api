import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Venta } from './operaciones.entity';
import { Cuota } from './cuotas.entity';

export enum EstadoCredito {
  Pendiente,
  Activo,
  Pagado, // Crédito pagado por completo
  EnDeuda, // Crédito con deuda pendiente (al menos 1 cuota vencida)
  Anulado,
}

export enum Periodo {
  Mensual,
  Quincenal,
  Semanal,
}

@Entity('creditos')
export class Credito extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Venta, (venta) => venta.id)
  venta: Venta;

  @Column('date')
  fechaInicio: Date;

  @Column('date', { nullable: true })
  fechaUltimoPago: Date;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  anticipo: number;

  @Column()
  cantidadCuotas: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  montoCuota: number;

  @Column({
    type: 'enum',
    enum: Periodo,
  })
  periodo: Periodo;

  @Column({
    type: 'enum',
    enum: EstadoCredito,
    default: EstadoCredito.Pendiente,
  })
  estado: EstadoCredito;

  @OneToMany(() => Cuota, (cuota) => cuota.credito, {
    cascade: true,
  })
  cuotas: Cuota[];

  static async obtenerCredito(id: number) {
    return await this.createQueryBuilder('credito')
      .leftJoinAndSelect('credito.venta', 'venta')
      .leftJoinAndSelect('venta.productos', 'detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('cliente.domicilios', 'domicilios')
      .leftJoinAndSelect('domicilios.barrio', 'barrio')
      .leftJoinAndSelect('barrio.localidad', 'localidad')
      .leftJoinAndSelect('barrio.zona', 'zona')
      .leftJoinAndSelect('cliente.telefonos', 'telefonos')
      .leftJoinAndSelect('credito.cuotas', 'cuotas')
      .where('credito.id = :id', { id })
      .getOne();
  }

  static async obtenerCreditosPorFechaVencimiento(fecha: Date) {
    // const fechaVenc = new Date(fecha);
    // fechaVenc.setHours(fechaVenc.getHours() + 3);

    const [creditos, count] = await this.createQueryBuilder('credito')
      .leftJoinAndSelect('credito.venta', 'venta')
      .leftJoinAndSelect('venta.productos', 'detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('cliente.domicilios', 'domicilios')
      .leftJoinAndSelect('domicilios.barrio', 'barrio')
      .leftJoinAndSelect('barrio.localidad', 'localidad')
      .leftJoinAndSelect('barrio.zona', 'zona')
      .leftJoinAndSelect('cliente.telefonos', 'telefonos')
      .leftJoinAndSelect('credito.cuotas', 'cuota')
      .where('cuota.fechaVencimiento = :fechaVenc', { fecha })
      .andWhere('credito.estado != :estado', {
        estado: EstadoCredito.Anulado + 1,
      })
      .getManyAndCount();

    return { creditos, count };
  }
}
