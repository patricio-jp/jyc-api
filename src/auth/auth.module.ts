import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';
import { ApiKey } from 'src/entities/api-keys/api-key.entity';
import { ApiKeysService } from './api-keys.service';
import { ApiKeysController } from './api-keys.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario, ApiKey])],
  providers: [AuthService, ApiKeysService],
  controllers: [AuthController, ApiKeysController],
  exports: [AuthService, ApiKeysService],
})
export class AuthModule {}
