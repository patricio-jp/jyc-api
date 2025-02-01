import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carton } from 'src/entities/cartones/carton.entity';
import { GrupoCartones } from 'src/entities/cartones/grupoCartones.entity';
import { CartonesService } from './cartones.service';
import { CartonesController } from './cartones.controller';
import { Credito } from 'src/entities/creditos/creditos.entity';

@Module({
  imports: [TypeOrmModule.forFeature([GrupoCartones, Carton, Credito])],
  controllers: [CartonesController],
  providers: [CartonesService],
})
export class CartonesModule {}
