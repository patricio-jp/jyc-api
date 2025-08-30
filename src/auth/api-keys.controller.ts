import { Controller, Post, Get, Body, UseGuards, Param } from '@nestjs/common';
import { ApiKeysService } from './api-keys.service';
import { Roles } from 'src/helpers/roleDetector';
import { Rol } from 'src/entities/usuarios/usuarios.entity';
import { RolesGuard } from './role.guard';
import { CreateAPIKeyDTO } from 'src/entities/api-keys/api-key.dto';

@Controller('api-keys')
@UseGuards(RolesGuard)
@Roles(Rol.Administrador)
export class ApiKeysController {
  constructor(private apiKeysService: ApiKeysService) {}

  @Post()
  async create(@Body() createAPIKeyDto: CreateAPIKeyDTO) {
    return this.apiKeysService.createApiKey(
      createAPIKeyDto.name,
      createAPIKeyDto.rol,
      createAPIKeyDto.ttlDays,
    );
  }

  @Get()
  async list() {
    return this.apiKeysService.listApiKeys();
  }

  @Post(':publicId/revoke')
  async revoke(@Param('publicId') publicId: string) {
    return this.apiKeysService.revokeApiKey(publicId);
  }
}
