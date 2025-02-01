import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateGrupoCartonesDTO {
  @IsOptional()
  @IsString()
  @ApiProperty()
  alias?: string;
}
