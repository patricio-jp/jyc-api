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
import { JwtModule } from '@nestjs/jwt';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LoggingInterceptor } from './helpers/interceptors/logger.interceptor';
import { BackupDatabaseModule } from './database/backup.module';
import { FileController } from './helpers/controllers/files.controller';
import { CartonesModule } from './cartones/cartones.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.register({
      secret: process.env.HASH_PASSWORD,
      global: true,
      signOptions: { expiresIn: '15m' },
    }),
    DatabaseModule,
    BackupDatabaseModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'uploads'),
    }),
    ClientesModule,
    UsuariosModule,
    VentasModule,
    CreditosModule,
    TypeOrmModule.forFeature([Cliente, Producto]),
    ProductosModule,
    AuthModule,
    CartonesModule,
  ],
  controllers: [AppController, FileController],
  providers: [
    AppService,
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
