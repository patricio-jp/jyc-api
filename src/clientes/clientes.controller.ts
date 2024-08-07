import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ClientesService } from './clientes.service';
import {
  CreateClienteDTO,
  UpdateClienteDTO,
} from 'src/entities/clientes/clientes.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Clientes')
@Controller('clientes')
export class ClientesController {
  constructor(private readonly clientesService: ClientesService) {}

  @Post()
  async create(@Body() createClienteDto: CreateClienteDTO) {
    return this.clientesService.create(createClienteDto);
  }

  @Get()
  async findAll() {
    const [data, count] = await this.clientesService.findAll();
    return { data, count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.clientesService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateClienteDto: UpdateClienteDTO,
  ) {
    return this.clientesService.update(+id, updateClienteDto);
  }

  @Delete(':id')
  async softRemove(@Param('id') id: string) {
    return this.clientesService.softRemove(+id);
  }

  @Delete(':id/force')
  async remove(@Param('id') id: string) {
    return this.clientesService.remove(+id);
  }
}
