import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Venta } from '../operaciones/ventas.entity';
import { Cuota, EstadoCuota } from '../cuotas/cuotas.entity';
import { Carton } from '../cartones/carton.entity';
import { CreateCreditoDTO, UpdateCreditoDTO } from './creditos.dto';

export enum EstadoCredito {
  Pendiente,
  Activo,
  Pagado, // Crédito pagado por completo
  EnDeuda, // Crédito con deuda pendiente (al menos 1 cuota vencida)
  Anulado,
}

export enum Periodo {
  Mensual,
  Quincenal,
  Semanal,
}

export enum CreditoUpdateTypes {
  Simple, // Para anticipo, montoCuota o fechaInicio (estado o fechaUltimoPago también)
  Full, // Crea nueva instancia y anula la existente. Para periodo o cantidadCuotas
  NonUpdate, // No require actualización
}

@Entity('creditos')
export class Credito extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Venta, (venta) => venta.id)
  venta: Venta;

  @RelationId((credito: Credito) => credito.venta)
  id_venta: number;

  @Column('date')
  fechaInicio: Date;

  @Column('date', { nullable: true })
  fechaUltimoPago: Date;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  anticipo: number;

  @Column()
  cantidadCuotas: number;

  @Column({
    type: 'decimal',
    precision: 14,
    scale: 2,
    default: 0,
  })
  montoCuota: number;

  @Column({
    type: 'enum',
    enum: Periodo,
  })
  periodo: Periodo;

  @Column({
    type: 'enum',
    enum: EstadoCredito,
    default: EstadoCredito.Pendiente,
  })
  estado: EstadoCredito;

  @OneToOne(() => Carton, (carton) => carton.credito, {
    cascade: true,
  })
  carton: Carton;

  @OneToMany(() => Cuota, (cuota) => cuota.credito, {
    cascade: true,
  })
  cuotas: Cuota[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date | null;

  static async obtenerCredito(id: number) {
    return await this.createQueryBuilder('credito')
      .leftJoinAndSelect('credito.venta', 'venta')
      .leftJoinAndSelect('venta.productos', 'detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('cliente.domicilios', 'domicilios')
      .leftJoinAndSelect('cliente.telefonos', 'telefonos')
      .leftJoinAndSelect('credito.cuotas', 'cuotas')
      .where('credito.id = :id', { id })
      .getOne();
  }

  static async obtenerCreditosPorVencimiento(fecha: Date) {
    // const fechaVenc = new Date(fecha);
    // fechaVenc.setHours(fechaVenc.getHours() + 3);

    const [creditos, count] = await this.createQueryBuilder('credito')
      .leftJoinAndSelect('credito.venta', 'venta')
      .leftJoinAndSelect('venta.productos', 'detalle')
      .leftJoinAndSelect('detalle.producto', 'producto')
      .leftJoinAndSelect('venta.cliente', 'cliente')
      .leftJoinAndSelect('cliente.domicilios', 'domicilios')
      .leftJoinAndSelect('cliente.telefonos', 'telefonos')
      .leftJoinAndSelect('credito.cuotas', 'cuota')
      .where('cuota.fechaVencimiento = :fechaVenc', { fecha })
      .andWhere('credito.estado != :estado', {
        estado: EstadoCredito.Anulado + 1,
      })
      .getManyAndCount();

    return { creditos, count };
  }

  static async obtenerCreditosCuotasVencidas() {
    return await this.createQueryBuilder('credito')
      .leftJoinAndSelect('credito.cuotas', 'cuota')
      .where('cuota.fechaVencimiento <= :fechaVenc', { fecha: new Date() })
      .getMany();
  }

  async anularCredito() {
    this.estado = EstadoCredito.Anulado;
    await this.save();

    await Cuota.createQueryBuilder()
      .update(Cuota)
      .set({ estado: EstadoCuota.Anulada })
      .where('creditoId = :creditoId', { creditoId: this.id })
      .andWhere('estado != :estado', { estado: EstadoCuota.Pagada })
      .execute();
  }

  compareWithDTO(dto: CreateCreditoDTO | UpdateCreditoDTO): CreditoUpdateTypes {
    if (this.id_venta !== dto.id_venta) {
      // Retornar NoUpdate si se compara con crédito de otra venta
      return CreditoUpdateTypes.NonUpdate;
    }
    // Si cambió el periodo o la cantidad de cuotas se requiere una actualización FULL
    if (
      this.periodo !== dto.periodo ||
      this.cantidadCuotas !== dto.cantidadCuotas
    ) {
      return CreditoUpdateTypes.Full;
    }

    // Si cambian otros campos (como fechaInicio, anticipo o montoCuota) se efectúa una actualización SIMPLE
    const fechaInicioActual = this.fechaInicio.getTime();
    const fechaInicioDTO = new Date(dto.fechaInicio).getTime();

    if (
      fechaInicioActual !== fechaInicioDTO ||
      this.anticipo !== dto.anticipo ||
      this.montoCuota !== dto.montoCuota
    ) {
      return CreditoUpdateTypes.Simple;
    }

    // Por defecto no se actualiza
    return CreditoUpdateTypes.NonUpdate;
  }
}
