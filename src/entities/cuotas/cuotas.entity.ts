import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Credito } from '../creditos/creditos.entity';

export enum EstadoCuota {
  aVencer,
  Vencida,
  Pagada,
  Anulada,
}

@Entity()
export class Cuota extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Credito, (credito) => credito.cuotas)
  credito: Credito;

  @RelationId((cuota: Cuota) => cuota.credito)
  id_credito: number;

  @Column()
  cuotaNro: number;

  @Column('date')
  fechaVencimiento: Date;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  montoCuota: number;

  @Column({
    type: 'date',
    nullable: true,
  })
  fechaPago: Date | null;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  montoPagado: number;

  @Column({
    type: 'enum',
    enum: EstadoCuota,
    default: EstadoCuota.aVencer,
  })
  estado: EstadoCuota;

  @Column({ nullable: true })
  observaciones?: string;

  static async obtenerVencimientosDelDia(fecha: Date) {
    return await this.createQueryBuilder('cuota')
      .leftJoin('cuota.credito', 'credito')
      .leftJoin('credito.venta', 'venta')
      .leftJoin('venta.cliente', 'cliente')
      .leftJoin('cliente.domicilios', 'domicilios')
      .leftJoin('cliente.telefonos', 'telefonos')
      .select(['cuota', 'cliente', 'domicilios', 'telefonos'])
      .where('cuota.fechaVencimiento = :fecha', { fecha })
      .andWhere('cuota.estado NOT IN (:...estados)', {
        estados: [EstadoCuota.Pagada, EstadoCuota.Anulada],
      })
      .getManyAndCount();
  }

  async cambiarEstado(estado: EstadoCuota, razon?: string) {
    this.estado = estado;
    this.observaciones = razon;
    await this.save();
  }
}
