import { Module } from '@nestjs/common';
import { IngresosService } from './ingresos.service';
import { IngresosController } from './ingresos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ingreso } from 'src/entities/operaciones/ingresos.entity';
import { Recibo } from 'src/entities/recibos/recibos.entity';
import { Cliente } from 'src/entities/clientes/clientes.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Ingreso, Recibo, Cliente])],
  controllers: [IngresosController],
  providers: [IngresosService],
  exports: [IngresosService],
})
export class IngresosModule {}
