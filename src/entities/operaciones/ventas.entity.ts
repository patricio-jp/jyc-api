import {
  Entity,
  Column,
  ManyToOne,
  RelationId,
  OneToMany,
  BaseEntity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Credito } from '../creditos/creditos.entity';
import { Producto } from '../productos/productos.entity';
import { Operacion } from './operaciones.entity';

@Entity('ventas')
export class Venta extends Operacion {
  @Column({
    type: 'date',
    nullable: true,
  })
  fechaEntrega?: Date;

  @ManyToOne(() => Cliente, (cliente) => cliente.ventas, {
    eager: true,
  })
  cliente: Cliente;

  @RelationId((venta: Venta) => venta.cliente)
  id_cliente: number;

  @OneToMany(() => Credito, (credito) => credito.venta, {
    eager: true,
    cascade: true,
  })
  financiacion: Credito[];

  @OneToMany(() => DetalleVenta, (detalle) => detalle.venta, {
    eager: true,
    cascade: true,
  })
  productos: DetalleVenta[];
}

@Entity('detalle_ventas')
export class DetalleVenta extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Venta, (venta) => venta.id)
  venta: Venta;

  @RelationId((detalle: DetalleVenta) => detalle.venta)
  id_venta: number;

  @ManyToOne(() => Producto, (producto) => producto.id, {
    eager: true,
  })
  producto: Producto;

  @RelationId((detalle: DetalleVenta) => detalle.producto)
  id_producto: number;

  @Column('int')
  cantidad: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  precioUnitario: number;
}
