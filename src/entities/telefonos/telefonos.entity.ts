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

export abstract class Telefono extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telefono: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}

@Entity('telefonos_cliente')
export class TelefonoCliente extends Telefono {
  @ManyToOne(() => Cliente, (cliente) => cliente.telefonos)
  cliente: Cliente;

  @RelationId((telefono: TelefonoCliente) => telefono.cliente)
  id_cliente: number;
}

@Entity('telefonos_usuarios')
export class TelefonoUsuario extends Telefono {
  @ManyToOne(() => Usuario, (usuario) => usuario.telefonos)
  usuario: Usuario;

  @RelationId((telefono: TelefonoUsuario) => telefono.usuario)
  id_usuario: number;
}
