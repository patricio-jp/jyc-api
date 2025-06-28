import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientesModule } from './clientes/clientes.module';
import { DatabaseModule } from './database/database.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { VentasModule } from './ventas/ventas.module';
import { CreditosModule } from './creditos/creditos.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ProductosModule } from './productos/productos.module';
import { FunctionsService } from './helpers/functions/functions.service';
import { AuthModule } from './auth/auth.module';
import { AuthGuard } from './auth/auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './helpers/interceptors/logger.interceptor';
import { FileController } from './helpers/controllers/files.controller';
import { CartonesModule } from './cartones/cartones.module';
import { IngresosModule } from './ingresos/ingresos.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.HASH_PASSWORD,
      global: true,
      signOptions: { expiresIn: '10m' },
    }),
    DatabaseModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'uploads'),
    }),
    SharedModule,
    ClientesModule,
    UsuariosModule,
    VentasModule,
    CreditosModule,
    ProductosModule,
    AuthModule,
    CartonesModule,
    IngresosModule,
  ],
  controllers: [FileController],
  providers: [
    FunctionsService,
    {
      provide: 'APP_GUARD',
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
