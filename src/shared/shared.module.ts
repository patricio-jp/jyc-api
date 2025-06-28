import { Module } from '@nestjs/common';
import { DomiciliosService } from './services/domicilios.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  DomicilioCliente,
  DomicilioUsuario,
} from 'src/entities/domicilios/domicilios.entity';
import { TelefonosService } from './services/telefonos.service';
import {
  TelefonoCliente,
  TelefonoUsuario,
} from 'src/entities/telefonos/telefonos.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DomicilioCliente,
      DomicilioUsuario,
      TelefonoCliente,
      TelefonoUsuario,
    ]),
  ],
  controllers: [],
  providers: [DomiciliosService, TelefonosService],
  exports: [DomiciliosService, TelefonosService],
})
export class SharedModule {}
