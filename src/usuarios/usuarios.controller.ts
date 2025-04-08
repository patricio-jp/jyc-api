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
import { UsuariosService } from './usuarios.service';
import {
  CreateUsuarioDTO,
  UpdateUsuarioDTO,
} from '../entities/usuarios/usuarios.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/helpers/roleDetector';
import { Rol } from 'src/entities/usuarios/usuarios.entity';
import { SkipAuth } from 'src/helpers/allowPublicAccess';
import { Request } from 'express';

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  //@Roles(Rol.Administrador, Rol.Supervisor)
  @SkipAuth() // TO-DO DELETE SkipAuth to protect endpoint
  async create(@Body() createUsuarioDto: CreateUsuarioDTO) {
    return this.usuariosService.create(createUsuarioDto);
  }

  @Get()
  @Roles(Rol.Administrador, Rol.Supervisor)
  async findAll(@Req() req: Request) {
    const { page = 1, pageSize = 10, ...filters } = req.query;
    const [data, count] = await this.usuariosService.findAll(
      Number(page),
      Number(pageSize),
      filters,
    );
    return { data, count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(+id);
  }

  @Patch(':id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDTO,
  ) {
    return this.usuariosService.update(+id, updateUsuarioDto);
  }

  @Delete(':id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async softDelete(@Param('id') id: string) {
    return this.usuariosService.softDelete(+id);
  }

  @Delete(':id/force')
  @Roles(Rol.Administrador)
  async delete(@Param('id') id: string) {
    return this.usuariosService.delete(+id);
  }
}
