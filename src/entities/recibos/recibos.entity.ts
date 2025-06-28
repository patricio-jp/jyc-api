import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Ingreso } from '../operaciones/ingresos.entity';
import { Cliente } from '../clientes/clientes.entity';

@Entity('recibos')
export class Recibo extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 36,
  })
  uuid: string;

  @ManyToOne(() => Cliente, (cliente) => cliente.pagos, {
    eager: true,
  })
  cliente: Cliente;

  @RelationId((recibo: Recibo) => recibo.cliente)
  id_cliente: number;

  @ManyToOne(() => Ingreso, (ingreso) => ingreso.recibo, {
    eager: true,
  })
  ingreso: Ingreso;

  @RelationId((recibo: Recibo) => recibo.ingreso)
  id_ingreso: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  get Ingreso(): Ingreso {
    return this.ingreso;
  }
}
