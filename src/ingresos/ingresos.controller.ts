import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { IngresosService } from './ingresos.service';
import {
  CreateIngresoDTO,
  UpdateIngresoDTO,
} from 'src/entities/operaciones/ingresos.dto';
import { Request } from 'express';
import { SkipAuth } from 'src/helpers/allowPublicAccess';

@Controller('ingresos')
export class IngresosController {
  constructor(private readonly ingresosService: IngresosService) {}

  @Post()
  create(@Body() createIngresoDto: CreateIngresoDTO) {
    return this.ingresosService.create(createIngresoDto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const { page = 1, pageSize = 10, ...filters } = req.query;
    const [data, count] = await this.ingresosService.findAll(
      Number(page),
      Number(pageSize),
      filters,
    );
    return { data, count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.ingresosService.findOne(+id);
  }

  @SkipAuth()
  @Get('/uuid/:uuid')
  async findByUUID(@Param('uuid') uuid: string) {
    return await this.ingresosService.findOneByUUID(uuid);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIngresoDto: UpdateIngresoDTO) {
    return this.ingresosService.update(+id, updateIngresoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ingresosService.softRemove(+id);
  }
}

@Controller('pagos')
export class PagosController {
  constructor(private readonly ingresosService: IngresosService) {}

  @Get(':uuid')
  validarPago(@Param('uuid') uuid: string) {
    return this.ingresosService.findOneByUUID(uuid);
  }
}
