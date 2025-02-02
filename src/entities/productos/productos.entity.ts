import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  //OneToOne,
  PrimaryGeneratedColumn,
  //RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Costo, Precio } from '../precios/precios.entity';
import { DetalleCompra } from '../operaciones/compras.entity';
import { DetalleVenta } from '../operaciones/ventas.entity';
/* import { Inventario } from '../inventario/inventario.entity'; */

@Entity('productos')
export class Producto extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  codigo: string;

  @Column()
  nombre: string;

  @Column('int', { default: 0 })
  stock: number;

  @OneToMany(() => Costo, (costo) => costo.producto, {
    cascade: true,
    eager: true,
  })
  costos: Costo[];

  @OneToMany(() => Precio, (precio) => precio.producto, {
    cascade: true,
    eager: true,
  })
  precios: Precio[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => DetalleCompra, (detalle) => detalle.producto)
  detallesCompra: DetalleCompra[];

  @OneToMany(() => DetalleVenta, (detalle) => detalle.producto)
  detallesVenta: DetalleVenta[];

  /* @OneToOne(() => Inventario, (inventario) => inventario.producto, {
    cascade: true,
    eager: true,
  })
  inventario: Inventario;

  @RelationId((producto: Producto) => producto.inventario)
  id_inventario: number; */
}
