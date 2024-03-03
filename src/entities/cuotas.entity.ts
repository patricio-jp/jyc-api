import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Credito } from './creditos.entity';

export enum EstadoCuota {
  aVencer,
  Vencida,
  Pagada,
}

@Entity()
export class Cuota extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Credito, (credito) => credito.cuotas)
  credito: Credito;

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
  fechaPago: Date;

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
}
