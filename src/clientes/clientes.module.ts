import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from 'src/entities/clientes/clientes.entity';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';
import { DomicilioCliente } from 'src/entities/domicilios/domicilios.entity';
import { TelefonoCliente } from 'src/entities/telefonos/telefonos.entity';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Cliente,
      Usuario,
      DomicilioCliente,
      TelefonoCliente,
    ]),
    SharedModule,
  ],
  controllers: [ClientesController],
  providers: [ClientesService],
})
export class ClientesModule {}
