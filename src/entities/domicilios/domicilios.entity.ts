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
import { Cliente } from '../clientes/clientes.entity';
import { Usuario } from '../usuarios/usuarios.entity';

export abstract class Domicilio extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  direccion: string;

  @Column()
  barrio: string;

  @Column()
  localidad: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

@Entity('domicilios_clientes')
export class DomicilioCliente extends Domicilio {
  @ManyToOne(() => Cliente, (cliente) => cliente.domicilios)
  cliente: Cliente;

  @RelationId((domicilio: DomicilioCliente) => domicilio.cliente)
  id_cliente: number;
}

@Entity('domicilios_usuarios')
export class DomicilioUsuario extends Domicilio {
  @ManyToOne(() => Usuario, (usuario) => usuario.domicilios)
  usuario: Usuario;

  @RelationId((domicilio: DomicilioUsuario) => domicilio.usuario)
  id_usuario: number;
}
