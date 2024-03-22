import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDecimal, IsISO8601, IsOptional } from 'class-validator';

export class CreatePrecioDTO {
  @IsDecimal({
    decimal_digits: '0,2',
  })
  @ApiProperty()
  precioUnitario: number;

  @IsISO8601()
  @ApiProperty()
  fechaInicio: Date;

  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaFin?: Date;
}

export class UpdatePrecioDTO extends PartialType(CreatePrecioDTO) {}
