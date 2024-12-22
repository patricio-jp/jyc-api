import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service';
import { VentasController } from './ventas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Venta } from 'src/entities/operaciones/ventas.entity';
//import { Inventario } from 'src/entities/inventario/inventario.entity';
import { Producto } from 'src/entities/productos/productos.entity';
import { Cliente } from 'src/entities/clientes/clientes.entity';
import { FunctionsService } from 'src/helpers/functions/functions.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Venta, Producto, /*  Inventario, */ Cliente]),
  ],
  controllers: [VentasController],
  providers: [VentasService, FunctionsService],
})
export class VentasModule {}
