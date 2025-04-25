import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsInt,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { EstadoUsuario, Rol } from './usuarios.entity';
import { CreateDomicilioDTO } from '../domicilios/domicilios.dto';
import { CreateTelefonoDTO } from '../telefonos/telefonos.dto';

export class CreateUsuarioDTO {
  @IsInt()
  @ApiProperty()
  dni: number;

  @IsString()
  @ApiProperty()
  nombre: string;

  @IsString()
  @ApiProperty()
  apellido: string;

  @IsString()
  @ApiProperty()
  password: string;

  @IsISO8601()
  @ApiProperty()
  fechaNacimiento: Date;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested()
  @ApiProperty()
  domicilios?: CreateDomicilioDTO[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested()
  @ApiProperty()
  telefonos?: CreateTelefonoDTO[];

  @IsISO8601()
  @ApiProperty()
  fechaInicio: Date;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @ApiProperty()
  comision?: number;

  @IsEnum(Rol)
  @ApiProperty()
  rol: Rol;

  @IsOptional()
  @IsEnum(EstadoUsuario)
  @ApiProperty()
  estado?: EstadoUsuario;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @ApiProperty()
  saldo?: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  observaciones?: string;
}

export class UpdateUsuarioDTO extends PartialType(CreateUsuarioDTO) {}

export class LoginDTO {
  @IsInt()
  @ApiProperty()
  dni: number;

  @IsString()
  @ApiProperty()
  password: string;
}

export class AskPasswordResetDTO {
  @IsInt()
  @ApiProperty()
  dni: number;
}

export class RestorePasswordDTO {
  @ValidateIf((o) => o.shouldValidate)
  @IsString()
  @ApiProperty()
  password: string;

  @ValidateIf((o) => o.shouldValidate)
  @IsString()
  @ApiProperty()
  confirmPassword: string;

  shouldValidate?: boolean;
}

export class SelfRestorePasswordDTO extends RestorePasswordDTO {
  @IsString()
  @ApiProperty()
  oldPassword: string;
}
