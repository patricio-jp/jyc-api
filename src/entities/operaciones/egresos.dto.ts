import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsISO8601, IsString, Min } from 'class-validator';

export class CreateEgresoDTO {
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
}
