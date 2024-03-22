import {
  BaseEntity,
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cliente } from '../clientes/clientes.entity';
import { Usuario } from '../usuarios/usuarios.entity';

export abstract class Telefono extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  telefono: string;
}

@Entity('telefonos_cliente')
export class TelefonoCliente extends Telefono {
  @ManyToOne(() => Cliente, (cliente) => cliente.telefonos)
  cliente: Cliente;
}

@Entity('telefonos_usuarios')
export class TelefonoUsuario extends Telefono {
  @ManyToOne(() => Usuario, (usuario) => usuario.telefonos)
  usuario: Usuario;
}
