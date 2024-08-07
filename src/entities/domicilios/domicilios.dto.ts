import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateDomicilioDTO {
  @IsString()
  @ApiProperty()
  direccion: string;

  @IsString()
  @ApiProperty()
  barrio: string;

  @IsString()
  @ApiProperty()
  localidad: string;
}

export class UpdateDomicilioDTO extends PartialType(CreateDomicilioDTO) {}
