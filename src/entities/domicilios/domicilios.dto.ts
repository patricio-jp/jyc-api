import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateDomicilioDTO {
  @IsString()
  @ApiProperty()
  direccion: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  ubicacion?: string;

  @IsInt()
  @ApiProperty()
  barrio_id: number;
}

export class UpdateDomicilioDTO extends PartialType(CreateDomicilioDTO) {}
