import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Usuario])],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
