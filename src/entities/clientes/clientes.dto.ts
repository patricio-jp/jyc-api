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
  ValidateNested,
} from 'class-validator';
import { EstadoCliente } from './clientes.entity';
import { CreateDomicilioDTO } from '../domicilios/domicilios.dto';
import { CreateTelefonoDTO } from '../telefonos/telefonos.dto';

export class CreateClienteDTO {
  @IsInt()
  @ApiProperty()
  dni: number;

  @IsString()
  @ApiProperty()
  nombre: string;

  @IsOptional()
  @IsString()
  @ApiProperty()
  apellido?: string;

  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaNacimiento?: Date;

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

  @IsOptional()
  @IsInt()
  @ApiProperty()
  id_vendedorAsociado?: number;

  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  vendedorAsociadoHasta?: Date;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  id_cobradorAsociado?: number;

  @IsOptional()
  @IsDecimal({ decimal_digits: '0,2' })
  @ApiProperty()
  saldo?: number;

  @IsOptional()
  @IsString()
  @ApiProperty()
  observaciones?: string;

  @IsOptional()
  @IsEnum(EstadoCliente)
  @ApiProperty()
  estado?: EstadoCliente;
}

export class UpdateClienteDTO extends PartialType(CreateClienteDTO) {}
