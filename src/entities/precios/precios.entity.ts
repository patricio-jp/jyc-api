import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Producto } from '../productos/productos.entity';

export abstract class Historico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  precioUnitario: number;

  @Column('date')
  fechaInicio: Date;

  @Column({
    type: 'date',
    nullable: true,
  })
  fechaFin: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

@Entity('precios')
export class Precio extends Historico {
  @ManyToOne(() => Producto, (producto) => producto.precios)
  producto: Producto;

  @RelationId((precio: Precio) => precio.producto)
  id_producto: number;
}

@Entity('costos')
export class Costo extends Historico {
  @ManyToOne(() => Producto, (producto) => producto.costos)
  producto: Producto;

  @RelationId((costo: Costo) => costo.producto)
  id_producto: number;
}
