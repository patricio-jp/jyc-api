import {
  Controller,
  Get,
  Post,
  Body,
  /* Patch, */
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import {
  CreateProductoDTO,
  ModifyProductoPrecioDTO,
} from 'src/entities/productos/productos.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  async create(@Body() createProductoDto: CreateProductoDTO) {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  async findAll() {
    const [data, count] = await this.productosService.findAll();
    return { data, count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productosService.findOne(+id);
  }

  /* @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateProductoDto: UpdateProductoDto,
  ) {
    return this.productosService.update(+id, updateProductoDto);
  } */

  @Patch(':id/precio')
  async cambiarPrecio(
    @Param('id') id: string,
    @Body() producto: ModifyProductoPrecioDTO,
  ) {
    return this.productosService.modificarPrecioCosto(+id, producto, 0);
  }

  @Patch(':id/costo')
  async cambiarCosto(
    @Param('id') id: string,
    @Body() producto: ModifyProductoPrecioDTO,
  ) {
    return this.productosService.modificarPrecioCosto(+id, producto, 1);
  }

  @Delete(':id')
  async softRemove(@Param('id') id: string) {
    return this.productosService.softRemove(+id);
  }

  @Delete(':id/force')
  async remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }
}
