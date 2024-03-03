import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Barrio } from './barrios.entity';
import { Cliente } from './clientes.entity';
import { Usuario } from './usuarios.entity';

export abstract class Domicilio extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  direccion: string;

  @Column('point', {
    nullable: true,
  })
  ubicacion?: string;

  @ManyToOne(() => Barrio, (barrio) => barrio.id, {
    cascade: ['insert', 'update'],
    eager: true,
  })
  barrio: Barrio;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('domicilios_clientes')
export class DomicilioCliente extends Domicilio {
  @ManyToOne(() => Cliente, (cliente) => cliente.domicilios)
  cliente: Cliente;
}

@Entity('domicilios_usuarios')
export class DomicilioUsuario extends Domicilio {
  @ManyToOne(() => Usuario, (usuario) => usuario.domicilios)
  usuario: Usuario;
}
