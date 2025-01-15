import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  Req,
  Patch,
} from '@nestjs/common';
import { VentasService } from './ventas.service';
import {
  CreateVentaDTO,
  CreateVentaWithFileDTO,
} from 'src/entities/operaciones/ventas.dto';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { Request } from 'express';
import { Roles } from 'src/helpers/roleDetector';
import { Rol } from 'src/entities/usuarios/usuarios.entity';

@ApiTags('Ventas')
@Controller('ventas')
export class VentasController {
  constructor(private readonly ventasService: VentasService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/ventas',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            new Date().toISOString() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${uniqueSuffix}_${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Body() createVentaDto: CreateVentaWithFileDTO,
    @Req() req: Request,
  ) {
    //console.log(req);
    if (typeof createVentaDto.data === 'string') {
      createVentaDto.data = JSON.parse(createVentaDto.data) as CreateVentaDTO;
    }
    if (file) {
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/ventas/${file.filename}`;
      createVentaDto.data.comprobante_url = fileUrl;
    }
    return this.ventasService.create(createVentaDto.data);
  }

  @Get()
  async findAll() {
    const [data, count] = await this.ventasService.findAll();
    return { data, count };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ventasService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/ventas',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const filename = `${uniqueSuffix}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @ApiConsumes('multipart/form-data')
  @Roles(Rol.Administrador, Rol.Supervisor)
  update(
    @Param('id') id: string,
    @Body() updateVentaDto: CreateVentaDTO,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/ventas/${file.filename}`;
    updateVentaDto.comprobante_url = fileUrl;
    return this.ventasService.update(+id, updateVentaDto);
  }

  @Delete(':id')
  @Roles(Rol.Administrador, Rol.Supervisor)
  async softRemove(@Param('id') id: string) {
    return this.ventasService.softRemove(+id);
  }

  @Delete(':id/force')
  @Roles(Rol.Administrador)
  async remove(@Param('id') id: string) {
    return this.ventasService.remove(+id);
  }
}
