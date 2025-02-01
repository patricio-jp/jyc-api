import {
  Controller,
  Get,
  Post,
  Body,
  /* Patch, */
  Param,
  Delete,
  Patch,
  Req,
} from '@nestjs/common';
import { ProductosService } from './productos.service';
import {
  CreateProductoDTO,
  ModifyProductoPrecioDTO,
} from 'src/entities/productos/productos.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/helpers/roleDetector';
import { Rol } from 'src/entities/usuarios/usuarios.entity';
import { Request } from 'express';

@ApiTags('Productos')
@Controller('productos')
export class ProductosController {
  constructor(private readonly productosService: ProductosService) {}

  @Post()
  @Roles(Rol.Administrador, Rol.Supervisor)
  async create(@Body() createProductoDto: CreateProductoDTO) {
    return this.productosService.create(createProductoDto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const { page = 1, pageSize = 10, ...filters } = req.query;
    const [data, count] = await this.productosService.findAll(
      Number(page),
      Number(pageSize),
      filters,
    );
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
  @Roles(Rol.Administrador, Rol.Supervisor)
  async cambiarPrecio(
    @Param('id') id: string,
    @Body() producto: ModifyProductoPrecioDTO,
  ) {
    return this.productosService.modificarPrecioCosto(+id, producto, 0);
  }

  @Patch(':id/costo')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async cambiarCosto(
    @Param('id') id: string,
    @Body() producto: ModifyProductoPrecioDTO,
  ) {
    return this.productosService.modificarPrecioCosto(+id, producto, 1);
  }

  @Delete(':id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async softRemove(@Param('id') id: string) {
    return this.productosService.softRemove(+id);
  }

  @Delete(':id/force')
  @Roles(Rol.Administrador)
  async remove(@Param('id') id: string) {
    return this.productosService.remove(+id);
  }
}
