import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Put,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import {
  CreateClienteDTO,
  UpdateClienteDTO,
} from 'src/entities/clientes/clientes.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/helpers/roleDetector';
import { Rol } from 'src/entities/usuarios/usuarios.entity';
import { Request } from 'express';
import { ReportesService } from 'src/shared/services/reportes.service';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(
    private readonly clientesService: ClientesService,
    private readonly reportesService: ReportesService,
  ) {}

  @Post()
  @Roles(Rol.Administrador, Rol.Supervisor)
  async create(@Body() createClienteDto: CreateClienteDTO) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  async findAll(@Req() req: Request) {
    const { page = 1, pageSize = 10, ...filters } = req.query;
    const [data, count] = await this.clientesService.findAll(
      Number(page),
      Number(pageSize),
      filters,
    );
    return { data, count };
  }

  @Get('/grupo/:grupoId')
  async findAllByCartonGroup(
    @Param('grupoId') grupoId: string,
    @Req() req: Request,
  ) {
    const { page = 1, pageSize = 10 } = req.query;
    const [data, count] = await this.clientesService.findAllByCartonGroup(
      Number(grupoId),
      Number(page),
      Number(pageSize),
    );
    return { data, count };
  }

  @Get('/planilla/mensual')
  async getPlanillaMensual(@Req() req: Request) {
    const { month, year } = req.query;
    return this.reportesService.getClientesConCreditosActivosOrdenados(
      +month,
      +year,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Put(':id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDTO,
  ) {
    return this.clientesService.update(+id, updateClienteDto);
  }

  @Delete(':id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async softRemove(@Param('id') id: string) {
    return this.clientesService.softRemove(+id);
  }

  @Delete(':id/force')
  @Roles(Rol.Administrador)
  async remove(@Param('id') id: string) {
    return this.clientesService.remove(+id);
  }

  @Patch(':id/restore')
  @Roles(Rol.Administrador)
  async restore(@Param('id') id: string) {
    return this.clientesService.restore(+id);
  }
}
