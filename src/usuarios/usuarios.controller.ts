import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import {
  CreateUsuarioDTO,
  UpdateUsuarioDTO,
} from '../entities/usuarios/usuarios.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  async create(@Body() createUsuarioDto: CreateUsuarioDTO) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  async findAll() {
    const [data, count] = await this.usuariosService.findAll();
    return { data, count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDTO,
  ) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  async softDelete(@Param('id') id: string) {
    return this.usuariosService.softDelete(+id);
  }

  @Delete(':id/force')
  async delete(@Param('id') id: string) {
    return this.usuariosService.delete(+id);
  }
}
