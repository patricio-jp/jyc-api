import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Departamento } from './departamentos.entity';
import { Barrio } from './barrios.entity';

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

  @OneToMany(() => Barrio, (barrio) => barrio.localidad, {
    cascade: ['insert', 'update'],
  })
  barrios: Barrio[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
