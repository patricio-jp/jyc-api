import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsISO8601,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CondicionOperacion, EstadoOperacion } from './operaciones.entity';

export class CreateOperacionDTO {
  @IsISO8601()
  @ApiProperty()
  fecha: Date;

  @IsOptional()
  @ApiProperty({ type: 'string', format: 'binary' })
  _comprobante?: any;

  @IsOptional()
  @ApiProperty()
  comprobante?: string;

  @IsOptional()
  @ApiHideProperty()
  comprobante_url?: string;

  @IsOptional()
  @Min(0)
  @Max(999999999999.99)
  @IsNumber({ maxDecimalPlaces: 2 })
  @ApiProperty()
  subtotal?: number;

  @IsOptional()
  @Min(0)
  @Max(999999999999.99)
  @IsNumber({ maxDecimalPlaces: 2 })
  @ApiProperty()
  descuento?: number;

  @Min(0)
  @Max(999999999999.99)
  @IsNumber({ maxDecimalPlaces: 2 })
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
