import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Recibo } from '../recibos/recibos.entity';

export enum FormaPago {
  Efectivo,
  Transferencia,
}

@Entity('ingresos')
export class Ingreso extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('date')
  fecha: Date;

  @Column()
  concepto: string;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  importe: number;

  @Column({
    type: 'enum',
    enum: FormaPago,
    default: FormaPago.Efectivo,
  })
  formaPago: FormaPago;

  @OneToOne(() => Recibo, (recibo) => recibo.ingreso, {
    cascade: true,
  })
  recibo: Recibo;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
