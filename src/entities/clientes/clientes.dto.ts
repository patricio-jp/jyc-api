import { ApiProperty, PartialType } from '@nestjs/swagger';
import {
  IsArray,
  IsDecimal,
  IsEnum,
  IsISO8601,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { EstadoCliente } from './clientes.entity';
import {
  CreateDomicilioDTO,
  UpdateDomicilioDTO,
} from '../domicilios/domicilios.dto';
import {
  CreateTelefonoDTO,
  UpdateTelefonoDTO,
} from '../telefonos/telefonos.dto';
import { CreateZonaDTO } from '../zonas/zonas.dto';

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
  @ValidateNested()
  @ApiProperty()
  domicilios?: CreateDomicilioDTO[] | UpdateDomicilioDTO[];

  @IsOptional()
  @IsArray()
  @ValidateNested()
  @ApiProperty()
  telefonos?: CreateTelefonoDTO[] | UpdateTelefonoDTO[];

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

  @IsInt()
  @ApiProperty()
  id_zona: number;

  @IsOptional()
  @IsObject()
  @ApiProperty()
  zona?: CreateZonaDTO;

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
