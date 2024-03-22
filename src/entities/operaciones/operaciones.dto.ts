import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { CondicionOperacion, EstadoOperacion } from './operaciones.entity';
import { CreateCreditoDTO } from '../creditos/creditos.dto';

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

class VentaInfo {
  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaEntrega?: Date;

  @IsInt()
  @ApiProperty()
  cliente_id: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested()
  @ApiProperty()
  productos: DetalleVentaDTO[];

  @IsOptional()
  @ValidateNested()
  @ApiProperty()
  financiacion?: CreateCreditoDTO;
}

class DetalleVentaDTO {
  @IsInt()
  @ApiProperty()
  producto_id: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  cantidad: number;

  @IsDecimal({
    decimal_digits: '0,2',
  })
  @Min(0.01)
  @ApiProperty()
  precioUnitario: number;
}

export class CreateVentaDTO extends IntersectionType(
  CreateOperacionDTO,
  VentaInfo,
) {}

class CompraInfo {
  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaRecepcion?: Date;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested()
  @ApiProperty()
  productos: DetalleCompraDTO[];
}

class DetalleCompraDTO {
  @IsInt()
  @ApiProperty()
  producto_id: number;

  @IsInt()
  @Min(1)
  @ApiProperty()
  cantidad: number;

  @IsDecimal({
    decimal_digits: '0,2',
  })
  @Min(0.01)
  @ApiProperty()
  costoUnitario: number;
}

export class CreateCompraDTO extends IntersectionType(
  CreateOperacionDTO,
  CompraInfo,
) {}
