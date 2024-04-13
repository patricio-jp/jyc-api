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
import { Departamento } from '../departamentos/departamentos.entity';
import { Barrio } from '../barrios/barrios.entity';

@Entity('localidades')
export class Localidad extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @ManyToOne(() => Departamento, (depto) => depto.localidades, {
    cascade: ['insert', 'update'],
  })
  departamento: Departamento;

  @RelationId((localidad: Localidad) => localidad.departamento)
  id_departamento: number;

  @OneToMany(() => Barrio, (barrio) => barrio.localidad, {
    cascade: ['insert', 'update'],
  })
  barrios: Barrio[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
