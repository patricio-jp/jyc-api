import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsPhoneNumber } from 'class-validator';

export class CreateTelefonoDTO {
  @IsPhoneNumber('AR')
  @ApiProperty()
  telefono: string;
}

export class UpdateTelefonoDTO extends PartialType(CreateTelefonoDTO) {}
