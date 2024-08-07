import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  Min,
} from 'class-validator';
import { EstadoCredito, Periodo } from './creditos.entity';

export class CreateCreditoDTO {
  @IsOptional()
  @IsInt()
  @ApiProperty()
  id_venta?: number;

  @IsISO8601()
  @ApiProperty()
  fechaInicio: Date;

  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaUltimoPago?: Date;

  @IsOptional()
  @IsDecimal({
    decimal_digits: '0,2',
  })
  @ApiProperty()
  anticipo?: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  cantidadCuotas: number;

  @IsDecimal({
    decimal_digits: '0,2',
  })
  @Min(0.01)
  @ApiProperty()
  montoCuota: number;

  @IsEnum(Periodo)
  @ApiProperty()
  periodo: Periodo;

  @IsOptional()
  @IsEnum(EstadoCredito)
  @ApiProperty()
  estado?: EstadoCredito;
}

export class CargarPagoDTO {
  @IsNumber()
  @Min(0.01)
  @ApiProperty()
  monto: number;

  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaPago?: Date;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  nroCuota?: number;
}
