import {
  Entity,
  Column,
  OneToMany,
  BaseEntity,
  PrimaryGeneratedColumn,
  ManyToOne,
  RelationId,
} from 'typeorm';
import { Producto } from '../productos/productos.entity';
import { Operacion } from './operaciones.entity';

@Entity('compras')
export class Compra extends Operacion {
  @Column({
    type: 'date',
    nullable: true,
  })
  fechaRecepcion?: Date;

  @OneToMany(() => DetalleCompra, (detalle) => detalle.compra, {
    eager: true,
    cascade: true,
  })
  productos: DetalleCompra[];
}

@Entity('detalle_compras')
export class DetalleCompra extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Compra, (compra) => compra.id)
  compra: Compra;

  @RelationId((detalle: DetalleCompra) => detalle.compra)
  id_compra: number;

  @ManyToOne(() => Producto, (producto) => producto.id)
  producto: Producto;

  @RelationId((detalle: DetalleCompra) => detalle.producto)
  id_producto: number;

  @Column('int')
  cantidad: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  costoUnitario: number;
}
