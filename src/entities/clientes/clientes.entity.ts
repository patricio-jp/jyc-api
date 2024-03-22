import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Domicilio, DomicilioCliente } from '../domicilios/domicilios.entity';
import { TelefonoCliente, Telefono } from '../telefonos/telefonos.entity';
import { Usuario } from '../usuarios/usuarios.entity';
import { Venta } from '../operaciones/operaciones.entity';

export enum EstadoCliente {
  AConfirmar, // Nuevo cliente
  Inactivo, // Sin créditos vigentes
  Activo, // Con 1 o más créditos vigentes
  ConDeuda, // Debe 1 o 2 cuotas de un crédito
  Incobrable, // Debe más de 2-3 cuotas de un crédito
}

/** TO-DO
 * Agregar campo para guardar foto de DNI
 * Agregar campo para guardar foto boleta de servicio
 */

@Entity('clientes')
export class Cliente extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ nullable: true })
  apellido?: string;

  @Column()
  @Index({ unique: true })
  dni: number;

  @OneToMany(() => DomicilioCliente, (domicilio) => domicilio.cliente, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  domicilios?: Domicilio[];

  @OneToMany(() => TelefonoCliente, (telefono) => telefono.cliente, {
    eager: true,
    cascade: true,
    onDelete: 'CASCADE',
  })
  telefonos?: Telefono[];

  @ManyToOne(() => Usuario, (usuario) => usuario.clientesAsociados)
  vendedorAsociado: Usuario;

  @Column({
    type: 'date',
    nullable: true,
  })
  vendedorAsociadoHasta?: Date;

  @ManyToOne(() => Usuario, (usuario) => usuario.clientesACobrar)
  cobradorAsociado?: Usuario;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  saldo: number;

  @Column({
    type: 'enum',
    enum: EstadoCliente,
    default: EstadoCliente.AConfirmar,
  })
  estado: EstadoCliente;

  @Column({ nullable: true })
  observaciones?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  @OneToMany(() => Venta, (venta) => venta.cliente)
  ventas: Venta[];

  static findByName(name: string) {
    return this.createQueryBuilder('cliente')
      .where('cliente.nombre = :name', { name })
      .orWhere('cliente.apellido = :name', { name })
      .getMany();
  }
}
