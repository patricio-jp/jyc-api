import { Module } from '@nestjs/common';
import { CreditosService } from './creditos.service';
import { CreditosController } from './creditos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Credito } from 'src/entities/creditos/creditos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Credito])],
  controllers: [CreditosController],
  providers: [CreditosService],
})
export class CreditosModule {}
