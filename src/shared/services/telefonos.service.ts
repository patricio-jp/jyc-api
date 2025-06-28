import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
  TelefonoCliente,
  TelefonoUsuario,
} from 'src/entities/telefonos/telefonos.entity';
import {
  CreateTelefonoDTO,
  UpdateTelefonoDTO,
} from 'src/entities/telefonos/telefonos.dto';

@Injectable()
export class TelefonosService {
  constructor(
    @InjectRepository(TelefonoCliente)
    private telefonoClienteRepo: Repository<TelefonoCliente>,
    @InjectRepository(TelefonoUsuario)
    private telefonoUsuarioRepo: Repository<TelefonoUsuario>,
  ) {}

  async createTelefonos<T extends TelefonoCliente | TelefonoUsuario>(
    telefonosDto: CreateTelefonoDTO[],
    tipo: 'cliente' | 'usuario',
  ): Promise<T[]> {
    const repo = (
      tipo === 'cliente' ? this.telefonoClienteRepo : this.telefonoUsuarioRepo
    ) as Repository<T>;
    const nuevosTelefonos = telefonosDto.map((dto) => {
      const telefono = repo.create(dto as DeepPartial<T>);
      return telefono;
    });
    return repo.save(nuevosTelefonos);
  }

  async updateTelefonos<T extends TelefonoCliente | TelefonoUsuario>(
    existentes: T[],
    nuevos: (CreateTelefonoDTO | UpdateTelefonoDTO)[],
    tipo: 'cliente' | 'usuario',
  ): Promise<T[]> {
    const repo =
      tipo === 'cliente' ? this.telefonoClienteRepo : this.telefonoUsuarioRepo;

    // Eliminar los que ya no están
    const toRemove = existentes.filter(
      (existente) =>
        !nuevos.some((nuevo) => 'id' in nuevo && nuevo.id === existente.id),
    );
    if (toRemove.length > 0) {
      await Promise.all(toRemove.map((dom) => repo.softDelete(dom.id)));
    }

    // Actualizar existentes y crear nuevos
    const result = await Promise.all(
      nuevos.map(async (telefono) => {
        if ('id' in telefono && telefono.id) {
          const existente = existentes.find((d) => d.id === telefono.id);
          if (existente) {
            await repo.update(existente.id, telefono);
            Object.assign(existente, telefono);
            return existente;
          }
        }
        // Nuevo telefono
        return repo.create(telefono);
      }),
    );
    return result as T[];
  }
}
