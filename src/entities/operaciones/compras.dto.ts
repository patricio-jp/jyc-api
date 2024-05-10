import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDecimal,
  IsISO8601,
  IsInt,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateOperacionDTO } from './operaciones.dto';

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

export class DetalleCompraDTO {
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
