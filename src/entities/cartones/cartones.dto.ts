import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
} from 'class-validator';
import { EstadoCarton } from './carton.entity';

export class CreateCartonDTO {
  @IsInt()
  @ApiProperty()
  id_credito: number;

  @IsOptional()
  @IsEnum(EstadoCarton)
  @ApiProperty()
  estado?: EstadoCarton;

  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaCarton?: Date;

  @IsOptional()
  @IsInt()
  @ApiProperty()
  id_grupoCartones?: number;
}

export class CambiarEstadoCartonDTO {
  @IsEnum(EstadoCarton)
  @ApiProperty()
  estado: EstadoCarton;

  @IsOptional()
  @IsISO8601()
  @ApiProperty()
  fechaCarton?: Date;

  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  actualizarGrupo?: boolean;
}
