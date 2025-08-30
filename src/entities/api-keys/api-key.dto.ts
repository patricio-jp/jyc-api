import { IsEnum, IsNumber, IsString } from 'class-validator';
import { Rol } from '../usuarios/usuarios.entity';

export class CreateAPIKeyDTO {
  @IsString()
  name: string;

  @IsEnum(Rol)
  rol: Rol;

  @IsNumber()
  ttlDays: number;
}
