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
  AskPasswordResetDTO,
  CreateUsuarioDTO,
  RestorePasswordDTO,
  SelfRestorePasswordDTO,
  UpdateUsuarioDTO,
} from '../entities/usuarios/usuarios.dto';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/helpers/roleDetector';
import { Rol } from 'src/entities/usuarios/usuarios.entity';
import { SkipAuth } from 'src/helpers/allowPublicAccess';
import { Request } from 'express';

interface CustomRequest extends Request {
  user?: { sub: number; rol: Rol };
}

@ApiTags('Usuarios')
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  @Roles(Rol.Administrador, Rol.Supervisor)
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

  @Post('/restorePassword')
  @SkipAuth()
  async askForPasswordReset(@Body() passDto: AskPasswordResetDTO) {
    return this.usuariosService.userAskForPasswordReset(passDto);
  }

  @Patch(':id/restorePassword')
  async restorePassword(
    @Param('id') id: string,
    @Body() passDto?: RestorePasswordDTO | SelfRestorePasswordDTO,
    @Req() req?: CustomRequest,
  ) {
    const userRole = req?.user?.rol;
    const userId = req?.user?.sub;

    if (userRole !== Rol.Administrador) {
      // Si no es administrador, solo puede pedir el reset de contraseña
      return this.usuariosService.askForPasswordReset(+id);
    }

    if (userId === +id) {
      // Si es el mismo usuario, puede pedir el reset de contraseña
      // o restaurar la contraseña si es administrador
      if (passDto) {
        passDto = Object.assign(
          (passDto as SelfRestorePasswordDTO)?.oldPassword
            ? new SelfRestorePasswordDTO()
            : new RestorePasswordDTO(),
          passDto,
        );
      }
      if (passDto instanceof SelfRestorePasswordDTO) {
        return this.usuariosService.restorePassword(
          +id,
          passDto as SelfRestorePasswordDTO,
        );
      } else {
        return this.usuariosService.askForPasswordReset(+id);
      }
    }

    // Si es un administrador y no es el mismo usuario, puede restaurar la contraseña
    if (userRole === Rol.Administrador && passDto) {
      return this.usuariosService.restorePassword(
        +id,
        passDto as RestorePasswordDTO,
      );
    }

    // Si es un administrador y no hay passDto, solo puede pedir el reset de contraseña
    return this.usuariosService.askForPasswordReset(+id);
  }

  /* @Patch(':id/restorePassword')
  async askForPasswordReset(@Param('id') id: string) {
    return this.usuariosService.askForPasswordReset(+id);
  } */

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
