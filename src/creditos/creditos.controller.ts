import {
  Controller,
  Get,
  /* Post, */
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';
import { CreditosService } from './creditos.service';
import { ApiTags } from '@nestjs/swagger';
import { CargarPagoDTO } from 'src/entities/creditos/creditos.dto';
import { EstadoCredito } from 'src/entities/creditos/creditos.entity';
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
  async findAll() {
    const [data, count] = await this.creditosService.findAll();
    return { data, count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.creditosService.findOne(+id);
  }

  @Get(':fecha')
  async getVencimientosDelDia(@Param('fecha') fecha: string) {
    return this.creditosService.getCreditosPorVencimiento(new Date(fecha));
  }

  /* @Patch(':id')
  update(@Param('id') id: string, @Body() updateCreditoDto: UpdateCreditoDto) {
    return this.creditosService.update(+id, updateCreditoDto);
  } */

  @Patch(':id/cargar-pago')
  async cargarPago(@Param('id') id: string, @Body() pago: CargarPagoDTO) {
    return id + pago;
  }

  @Patch(':id/estado')
  async cambiarEstado(@Param('id') id: string, @Body() estado: EstadoCredito) {
    return this.creditosService.cambiarEstado(+id, estado);
  }

  @Patch(':id/anular')
  async anularCredito(@Param('id') id: string) {
    return this.creditosService.cambiarEstado(+id, EstadoCredito.Anulado);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.creditosService.softRemove(+id);
  }
}
