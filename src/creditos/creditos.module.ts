import { Module } from '@nestjs/common';
import { CreditosService } from './creditos.service';
import { CreditosController } from './creditos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credito } from 'src/entities/creditos/creditos.entity';
import { Carton } from 'src/entities/cartones/carton.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credito, Carton])],
  controllers: [CreditosController],
  providers: [CreditosService],
})
export class CreditosModule {}
