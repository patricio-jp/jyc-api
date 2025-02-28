import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPhoneNumber } from 'class-validator';

export class CreateTelefonoDTO {
  @IsPhoneNumber('AR')
  @ApiProperty()
  telefono: string;
}

export class UpdateTelefonoDTO extends CreateTelefonoDTO {
  @IsNumber()
  id: number;
}
