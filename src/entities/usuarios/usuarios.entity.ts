import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Domicilio, DomicilioUsuario } from '../domicilios/domicilios.entity';
import { Telefono, TelefonoUsuario } from '../telefonos/telefonos.entity';
import { Cliente } from '../clientes/clientes.entity';

export enum Rol {
  Vendedor,
  Cobrador,
  Supervisor,
  Administrador,
}

@Entity('usuarios')
export class Usuario extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  dni: number;

  @Column()
  nombre: string;

  @Column()
  apellido: string;

  @Column()
  password: string;

  @Column('date')
  fechaNacimiento: Date;

  @OneToMany(() => DomicilioUsuario, (domicilio) => domicilio.usuario)
  domicilios: Domicilio[];

  @OneToMany(() => TelefonoUsuario, (telefono) => telefono.usuario)
  telefonos: Telefono[];

  @Column('date')
  fechaInicio: Date;

  @Column({
    type: 'decimal',
    precision: 3,
    scale: 2,
    default: 0,
  })
  comision: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  saldo: number;

  @Column({ nullable: true })
  observaciones: string;

  @Column({
    type: 'enum',
    enum: Rol,
    default: Rol.Vendedor,
  })
  rol: Rol;

  @OneToMany(() => Cliente, (cliente) => cliente.vendedorAsociado)
  clientesAsociados: Cliente[];

  @OneToMany(() => Cliente, (cliente) => cliente.cobradorAsociado)
  clientesACobrar: Cliente[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;
}
