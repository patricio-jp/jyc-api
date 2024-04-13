import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Credito } from '../creditos/creditos.entity';
import { Cliente } from '../clientes/clientes.entity';
import { Producto } from '../productos/productos.entity';

export enum CondicionOperacion {
  CONTADO = 'CONTADO',
  CTA_CTE = 'CTA CTE',
}

export enum EstadoOperacion {
  Pendiente,
  // Aprobado,
  ParaEntregar,
  Pagado, // En caso de venta al contado
  Entregado,
  Anulado,
}

export abstract class Operacion extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  fecha: Date;

  @Column({ nullable: true })
  comprobante?: string;

  @Column({ nullable: true })
  comprobanteUrl?: string;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  subtotal: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  descuento: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  total: number;

  @Column({
    type: 'enum',
    enum: CondicionOperacion,
    default: CondicionOperacion.CTA_CTE,
  })
  condicion: CondicionOperacion;

  @Column({ nullable: true })
  observaciones?: string;

  @Column({
    type: 'enum',
    enum: EstadoOperacion,
    default: EstadoOperacion.Pendiente,
  })
  estado: EstadoOperacion;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

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
