import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDepartamentoDTO {
  @IsString()
  @ApiProperty()
  nombre: string;
}

export class UpdateDepartamentoDTO extends PartialType(CreateDepartamentoDTO) {}
