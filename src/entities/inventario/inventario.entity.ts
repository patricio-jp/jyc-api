/* import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Producto } from '../productos/productos.entity';

@Entity('inventario')
export class Inventario extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('int')
  stock: number;

  @OneToOne(() => Producto, (producto) => producto.inventario)
  @JoinColumn()
  producto: Producto;

  @RelationId((inventario: Inventario) => inventario.producto)
  id_producto: number;
} */
