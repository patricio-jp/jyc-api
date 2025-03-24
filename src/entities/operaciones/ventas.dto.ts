import { ApiProperty, IntersectionType, PartialType } from '@nestjs/swagger';
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
import { CreateCreditoDTO, UpdateCreditoDTO } from '../creditos/creditos.dto';
import { CreateOperacionDTO } from './operaciones.dto';

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

export class DetalleVentaDTO {
  @IsInt()
  @ApiProperty()
  id_producto: number;

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

export class CreateVentaWithFileDTO {
  data: CreateVentaDTO;
  file: Express.Multer.File;
}

export class UpdateVentaDTO extends PartialType(CreateVentaDTO) {
  @IsOptional()
  @ValidateNested()
  @ApiProperty()
  financiacion?: UpdateCreditoDTO;
}

export class UpdateVentaWithFileDTO {
  data: UpdateVentaDTO;
  file: Express.Multer.File;
}
