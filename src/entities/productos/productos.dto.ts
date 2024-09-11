import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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

  @IsOptional()
  @IsInt()
  @Min(0)
  @ApiProperty()
  stock?: number;
}

export class UpdateProductoDTO extends PartialType(CreateProductoDTO) {}

export class ModifyProductoPrecioDTO {
  @IsISO8601()
  @ApiProperty()
  fechaInicio: Date;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @ApiProperty()
  precioUnitario: number;

  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaFin?: Date;
}
