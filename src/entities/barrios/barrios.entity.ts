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

  @RelationId((barrio: Barrio) => barrio.localidad)
  id_localidad: number;

  @ManyToOne(() => Zona, (zona) => zona.barrios, {
    cascade: ['insert', 'update'],
  })
  zona: Zona;

  @RelationId((barrio: Barrio) => barrio.zona)
  id_zona: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
