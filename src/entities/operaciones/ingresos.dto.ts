import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EstadoIngreso, FormaPago } from './ingresos.entity';

export class CreateIngresoDTO {
  @IsISO8601()
  @ApiProperty()
  fecha: Date;

  @IsString()
  @ApiProperty()
  concepto: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0.01)
  @ApiProperty()
  importe: number;

  @IsEnum(FormaPago)
  @ApiProperty()
  formaPago: FormaPago;

  @IsOptional()
  @IsEnum(EstadoIngreso)
  @ApiProperty()
  estado?: EstadoIngreso;

  @IsInt()
  @ApiProperty()
  cliente_id: number;
}

export class UpdateIngresoDTO extends PartialType(CreateIngresoDTO) {}
