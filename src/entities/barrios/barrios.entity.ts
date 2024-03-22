import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Localidad } from '../localidades/localidades.entity';
import { Zona } from '../zonas/zonas.entity';

@Entity('barrios')
export class Barrio extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToOne(() => Localidad, (localidad) => localidad.barrios, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  localidad: Localidad;

  @ManyToOne(() => Zona, (zona) => zona.barrios, {
    cascade: ['insert', 'update'],
  })
  zona: Zona;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
