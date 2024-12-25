import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ClientesModule } from './clientes/clientes.module';
import { DatabaseModule } from './database/database.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VentasModule } from './ventas/ventas.module';
import { CreditosModule } from './creditos/creditos.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cliente } from './entities/clientes/clientes.entity';
import { Producto } from './entities/productos/productos.entity';
import { ProductosModule } from './productos/productos.module';
import { FunctionsService } from './helpers/functions/functions.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot(),
    DatabaseModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
    }),
    ClientesModule,
    UsuariosModule,
    VentasModule,
    CreditosModule,
    TypeOrmModule.forFeature([Cliente, Producto]),
    ProductosModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    FunctionsService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
