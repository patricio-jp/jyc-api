import { ApiProperty } from '@nestjs/swagger';
import {
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsInt,
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
