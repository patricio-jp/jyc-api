import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { EstadoCredito, Periodo } from './creditos.entity';
import { EstadoCarton } from '../cartones/carton.entity';

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

  @IsOptional()
  @IsEnum(EstadoCarton)
  @ApiProperty()
  estadoCarton?: EstadoCredito;

  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaCarton?: Date;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  id_grupoCartones?: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  alias_grupoCartones?: string;
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
