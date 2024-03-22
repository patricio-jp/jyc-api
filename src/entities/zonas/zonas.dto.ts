import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateZonaDTO {
  @IsString()
  @ApiProperty()
  nombre: string;
}

export class UpdateZonaDTO extends PartialType(CreateZonaDTO) {}
