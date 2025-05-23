import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from 'src/entities/operaciones/ventas.entity';
import { Producto } from 'src/entities/productos/productos.entity';
import { Cliente } from 'src/entities/clientes/clientes.entity';
import { FunctionsService } from 'src/helpers/functions/functions.service';
import { GrupoCartones } from 'src/entities/cartones/grupoCartones.entity';
import { Carton } from 'src/entities/cartones/carton.entity';
import { IngresosModule } from 'src/ingresos/ingresos.module';
import { CreditosModule } from 'src/creditos/creditos.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, Producto, Carton, GrupoCartones, Cliente]),
    IngresosModule,
    CreditosModule,
  ],
  controllers: [VentasController],
  providers: [VentasService, FunctionsService],
})
export class VentasModule {}
