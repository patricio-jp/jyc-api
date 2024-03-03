import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service';
import { ClientesController } from './clientes.controller';
import { DatabaseModule } from 'src/database/database.module';
import { clientesProviders } from 'src/providers/clientes.providers';

@Module({
  imports: [DatabaseModule],
  controllers: [ClientesController],
  providers: [...clientesProviders, ClientesService],
})
export class ClientesModule {}
