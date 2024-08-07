import { ApiProperty } from '@nestjs/swagger';
import { IsInt } from 'class-validator';

export class InventarioDTO {
  @IsInt()
  @ApiProperty()
  id_producto: number;

  @IsInt()
  @ApiProperty()
  stock: number;
}
