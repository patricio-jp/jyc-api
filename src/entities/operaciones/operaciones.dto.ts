import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
} from 'class-validator';
import { CondicionOperacion, EstadoOperacion } from './operaciones.entity';

export class CreateOperacionDTO {
  @IsISO8601()
  @ApiProperty()
  fecha: Date;

  @IsOptional()
  @IsString()
  @ApiProperty()
  comprobante?: string;

  @IsOptional()
  @IsDecimal({
    decimal_digits: '0,2',
  })
  @ApiProperty()
  subtotal?: number;

  @IsOptional()
  @IsDecimal({
    decimal_digits: '0,2',
  })
  @ApiProperty()
  descuento?: number;

  @IsDecimal({
    decimal_digits: '0,2',
  })
  @ApiProperty()
  total: number;

  @IsEnum(CondicionOperacion)
  @ApiProperty()
  condicion: CondicionOperacion;

  @IsOptional()
  @IsString()
  @ApiProperty()
  observaciones?: string;

  @IsOptional()
  @IsEnum(EstadoOperacion)
  @ApiProperty()
  estado?: EstadoOperacion;
}
