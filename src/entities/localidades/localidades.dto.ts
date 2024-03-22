import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateLocalidadDTO {
  @IsString()
  @ApiProperty()
  nombre: string;

  @IsInt()
  @ApiProperty()
  departamento_id: number;
}

export class UpdateLocalidadDTO extends PartialType(CreateLocalidadDTO) {}
