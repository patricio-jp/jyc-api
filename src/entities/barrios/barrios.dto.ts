import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateBarrioDTO {
  @IsString()
  @ApiProperty()
  nombre: string;

  @IsInt()
  @ApiProperty()
  localidad_id: number;

  @IsInt()
  @ApiProperty()
  zona_id: number;
}

export class UpdateBarrioDTO extends PartialType(CreateBarrioDTO) {}
