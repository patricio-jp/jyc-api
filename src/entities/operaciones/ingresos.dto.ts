import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsDecimal,
  IsEnum,
  IsInt,
  IsISO8601,
  IsString,
  Min,
} from 'class-validator';
import { FormaPago } from './ingresos.entity';

export class CreateIngresoDTO {
  @IsISO8601()
  @ApiProperty()
  fecha: Date;

  @IsString()
  @ApiProperty()
  concepto: string;

  @IsDecimal({
    decimal_digits: '0,2',
  })
  @Min(0.01)
  @ApiProperty()
  importe: number;

  @IsEnum(FormaPago)
  @ApiProperty()
  formaPago: FormaPago;

  @IsInt()
  @ApiProperty()
  cliente_id: number;
}

export class UpdateIngresoDTO extends PartialType(CreateIngresoDTO) {}
