import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Carton } from './carton.entity';

@Entity('grupo_cartones')
export class GrupoCartones {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  alias: string;

  @OneToMany(() => Carton, (carton) => carton.grupoCartones)
  cartones: Carton[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
