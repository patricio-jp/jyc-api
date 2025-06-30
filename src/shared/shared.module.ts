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
import { ReportesService } from './services/reportes.service';
import { Cliente } from 'src/entities/clientes/clientes.entity';
import { ReportesController } from './services/reportes.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DomicilioCliente,
      DomicilioUsuario,
      TelefonoCliente,
      TelefonoUsuario,
      Cliente,
    ]),
  ],
  controllers: [ReportesController],
  providers: [DomiciliosService, TelefonosService, ReportesService],
  exports: [DomiciliosService, TelefonosService, ReportesService],
})
export class SharedModule {}
