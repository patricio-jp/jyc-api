import { Module } from '@nestjs/common';
import { CreditosService } from './creditos.service';
import { CreditosController } from './creditos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credito } from 'src/entities/creditos/creditos.entity';
import { Carton } from 'src/entities/cartones/carton.entity';
import { IngresosModule } from 'src/ingresos/ingresos.module';
import { GrupoCartones } from 'src/entities/cartones/grupoCartones.entity';
import { Venta } from 'src/entities/operaciones/ventas.entity';
import { FunctionsService } from 'src/helpers/functions/functions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Credito, Carton, GrupoCartones, Venta]),
    IngresosModule,
  ],
  controllers: [CreditosController],
  providers: [CreditosService, FunctionsService],
  exports: [CreditosService],
})
export class CreditosModule {}
