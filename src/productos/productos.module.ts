import { Module } from '@nestjs/common';
import { ProductosService } from './productos.service';
import { ProductosController } from './productos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Producto } from 'src/entities/productos/productos.entity';
//import { Inventario } from 'src/entities/inventario/inventario.entity';
import { Costo, Precio } from 'src/entities/precios/precios.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Producto, /* Inventario,  */ Precio, Costo]),
  ],
  controllers: [ProductosController],
  providers: [ProductosService],
})
export class ProductosModule {}
