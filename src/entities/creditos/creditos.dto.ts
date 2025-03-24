import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { EstadoCredito, Periodo } from './creditos.entity';
import { EstadoCarton } from '../cartones/carton.entity';
import { FormaPago } from '../operaciones/ingresos.entity';

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

  @IsOptional()
  @IsEnum(FormaPago)
  @ApiProperty()
  formaPagoAnticipo?: FormaPago;

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
  estadoCarton?: EstadoCarton;

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

  @IsEnum(FormaPago)
  @ApiProperty()
  formaPago: FormaPago;

  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaPago?: Date;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  nroCuota?: number;
}

export class UpdateCreditoDTO extends CreateCreditoDTO {
  @IsUUID()
  @ApiProperty()
  uuidRecibo: string;
}
