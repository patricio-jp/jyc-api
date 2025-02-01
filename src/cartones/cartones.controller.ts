import {
  Controller,
  Get,
  /* Post, */
  Body,
  Param,
  Delete,
  Patch,
  Req,
  Post,
  Put,
} from '@nestjs/common';
import { CartonesService } from './cartones.service';
import { ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/helpers/roleDetector';
import { Rol } from 'src/entities/usuarios/usuarios.entity';
import { Request } from 'express';
import { CreateGrupoCartonesDTO } from 'src/entities/cartones/grupoCartones.dto';
import {
  CambiarEstadoCartonDTO,
  CreateCartonDTO,
} from 'src/entities/cartones/cartones.dto';
// import { CreateCreditoDTO } from 'src/entities/creditos/creditos.dto';

@ApiTags('Cartones')
@Controller('cartones')
export class CartonesController {
  constructor(private readonly cartonesService: CartonesService) {}

  @Get()
  async getAllCartones(@Req() req: Request) {
    const { page = 1, pageSize = 10, ...filters } = req.query;
    const [data, count] = await this.cartonesService.getAllCartones(
      Number(page),
      Number(pageSize),
      filters,
    );
    return { data, count };
  }

  @Get('/grupos')
  async getAllGrupos(@Req() req: Request) {
    const { page = 1, pageSize = 10, ...filters } = req.query;
    const [data, count] = await this.cartonesService.getAllGrupos(
      Number(page),
      Number(pageSize),
      filters,
    );
    return { data, count };
  }

  @Get(':id')
  async findOneCarton(@Param('id') id: string) {
    return this.cartonesService.getCarton(+id);
  }

  @Get('/grupos/:id')
  async findOneGrupo(@Param('id') id: string) {
    return this.cartonesService.getGrupoCartones(+id);
  }

  @Post()
  @Roles(Rol.Administrador, Rol.Supervisor)
  async createCarton(@Body() cartonDto: CreateCartonDTO) {
    return this.cartonesService.nuevoCarton(cartonDto);
  }

  @Post('/grupos')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async crearGrupo(@Body() grupoDto: CreateGrupoCartonesDTO) {
    return this.cartonesService.nuevoGrupoCartones(grupoDto);
  }

  @Put('/grupos/:id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  updateGrupo(
    @Param('id') id: string,
    @Body() grupoDto: CreateGrupoCartonesDTO,
  ) {
    return this.cartonesService.updateGrupoCartones(+id, grupoDto);
  }

  @Patch(':idCarton/agregarAGrupo/:idGrupo')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async asignarCartonAGrupo(
    @Param('idCarton') idCarton: string,
    @Param('idGrupo') idGrupo: string,
  ) {
    return this.cartonesService.asignarCartonAGrupo(+idCarton, +idGrupo);
  }

  @Patch(':id/eliminarDeGrupo')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async eliminarCartonDeGrupo(@Param('id') id: string) {
    return this.cartonesService.eliminarCartonDeGrupo(+id);
  }

  @Patch(':id/estado')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async cambiarEstadoCarton(
    @Param('id') id: string,
    @Body() estado: CambiarEstadoCartonDTO,
  ) {
    return this.cartonesService.cambiarEstadoCarton(+id, estado);
  }

  @Delete(':id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async removeCarton(@Param('id') id: string) {
    return this.cartonesService.deleteCarton(+id);
  }

  @Delete('/grupos/:id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async removeGrupo(@Param('id') id: string) {
    return this.cartonesService.deleteGrupoCartones(+id);
  }

  @Patch(':id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async restoreCarton(@Param('id') id: string) {
    return this.cartonesService.restoreCarton(+id);
  }

  @Patch('/grupos/:id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async restoreGrupo(@Param('id') id: string) {
    return this.cartonesService.restoreGrupoCartones(+id);
  }
}
