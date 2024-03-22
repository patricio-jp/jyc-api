import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { usuariosProviders } from 'src/providers/usuarios.providers';

@Module({
  controllers: [UsuariosController],
  providers: [...usuariosProviders, UsuariosService],
})
export class UsuariosModule {}
