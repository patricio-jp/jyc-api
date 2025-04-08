import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { WinstonLogger } from 'src/helpers/winston.logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new WinstonLogger(),
  });

  app.enableCors();

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableShutdownHooks();

  const config = new DocumentBuilder()
    .setTitle('JyC Amoblamientos')
    .setDescription('API para JyC Amoblamientos')
    .setVersion('1.0.0')
    .addTag('Usuarios')
    .addTag('Clientes')
    .addTag('Domicilios')
    .addTag('Zonas')
    .addTag('Ventas')
    .addTag('Créditos')
    .addTag('Productos')
    .addTag('Inventario')
    .addTag('Ingresos')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
