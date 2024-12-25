import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.HASH_PASSWORD,
      global: true,
      signOptions: { expiresIn: '3h' },
    }),
    TypeOrmModule.forFeature([Usuario]),
  ],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
