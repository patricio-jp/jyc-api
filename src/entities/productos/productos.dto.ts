import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsString,
  ValidateNested,
} from 'class-validator';
import { CreatePrecioDTO } from '../precios/precios.dto';

export class CreateProductoDTO {
  @IsString()
  @ApiProperty()
  codigo: string;

  @IsString()
  @ApiProperty()
  nombre: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested()
  @ApiProperty()
  costos: CreatePrecioDTO[];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested()
  @ApiProperty()
  precios: CreatePrecioDTO[];
}
