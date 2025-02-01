import {
  Controller,
  Get,
  /* Post, */
  Body,
  Param,
  Delete,
  Patch,
  Req,
} from '@nestjs/common';
import { CreditosService } from './creditos.service';
import { ApiTags } from '@nestjs/swagger';
import { CargarPagoDTO } from 'src/entities/creditos/creditos.dto';
import { EstadoCredito } from 'src/entities/creditos/creditos.entity';
import { CambiarEstadoCartonDTO } from 'src/entities/cartones/cartones.dto';
import { Roles } from 'src/helpers/roleDetector';
import { Rol } from 'src/entities/usuarios/usuarios.entity';
import { Request } from 'express';
// import { CreateCreditoDTO } from 'src/entities/creditos/creditos.dto';

@ApiTags('Créditos')
@Controller('creditos')
export class CreditosController {
  constructor(private readonly creditosService: CreditosService) {}

  /* @Post()
  create(@Body() createCreditoDto: CreateCreditoDTO) {
    return this.creditosService.create(createCreditoDto);
  } */

  @Get()
  async findAll(@Req() req: Request) {
    const { page = 1, pageSize = 10, ...filters } = req.query;
    const [data, count] = await this.creditosService.findAll(
      Number(page),
      Number(pageSize),
      filters,
    );
    return { data, count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.creditosService.findOne(+id);
  }

  @Get(':fecha')
  @Roles(Rol.Administrador, Rol.Supervisor, Rol.Cobrador)
  async getVencimientosDelDia(@Param('fecha') fecha: string) {
    return this.creditosService.getCreditosPorVencimiento(new Date(fecha));
  }

  /* @Patch(':id')
  update(@Param('id') id: string, @Body() updateCreditoDto: UpdateCreditoDto) {
    return this.creditosService.update(+id, updateCreditoDto);
  } */

  @Patch(':id/cargar-pago')
  @Roles(Rol.Administrador, Rol.Supervisor, Rol.Cobrador)
  async cargarPago(@Param('id') id: string, @Body() pago: CargarPagoDTO) {
    return this.creditosService.cargarPago(+id, pago);
  }

  @Patch(':id/estadoCarton')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async cambiarEstadoCarton(
    @Param('id') id: string,
    @Body() estado: CambiarEstadoCartonDTO,
  ) {
    return this.creditosService.cambiarEstadoCarton(+id, estado);
  }

  @Patch(':id/estado')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async cambiarEstado(@Param('id') id: string, @Body() estado: EstadoCredito) {
    return this.creditosService.cambiarEstado(+id, estado);
  }

  @Patch(':id/anular')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async anularCredito(@Param('id') id: string) {
    return this.creditosService.cambiarEstado(+id, EstadoCredito.Anulado);
  }

  @Delete(':id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async remove(@Param('id') id: string) {
    return this.creditosService.softRemove(+id);
  }
}
