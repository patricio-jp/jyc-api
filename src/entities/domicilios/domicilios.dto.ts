import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateDomicilioDTO {
  @IsOptional()
  @IsString()
  @ApiProperty()
  direccion?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  barrio?: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  localidad?: string;
}

export class UpdateDomicilioDTO extends PartialType(CreateDomicilioDTO) {
  @IsNumber()
  id: number;
}
