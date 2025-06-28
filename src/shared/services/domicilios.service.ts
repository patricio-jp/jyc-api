import { Injectable } from '@nestjs/common';
import { DeepPartial, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { DomicilioCliente } from 'src/entities/domicilios/domicilios.entity';
import { DomicilioUsuario } from 'src/entities/domicilios/domicilios.entity';
import {
  CreateDomicilioDTO,
  UpdateDomicilioDTO,
} from 'src/entities/domicilios/domicilios.dto';

@Injectable()
export class DomiciliosService {
  constructor(
    @InjectRepository(DomicilioCliente)
    private domicilioClienteRepo: Repository<DomicilioCliente>,
    @InjectRepository(DomicilioUsuario)
    private domicilioUsuarioRepo: Repository<DomicilioUsuario>,
  ) {}

  async createDomicilios<T extends DomicilioCliente | DomicilioUsuario>(
    domiciliosDto: CreateDomicilioDTO[],
    tipo: 'cliente' | 'usuario',
  ): Promise<T[]> {
    const repo = (
      tipo === 'cliente' ? this.domicilioClienteRepo : this.domicilioUsuarioRepo
    ) as Repository<T>;
    const nuevosDomicilios = domiciliosDto.map((dto) => {
      const domicilio = repo.create(dto as DeepPartial<T>);
      return domicilio;
    });
    return repo.save(nuevosDomicilios);
  }

  async updateDomicilios<T extends DomicilioCliente | DomicilioUsuario>(
    existentes: T[],
    nuevos: (CreateDomicilioDTO | UpdateDomicilioDTO)[],
    tipo: 'cliente' | 'usuario',
  ): Promise<T[]> {
    const repo =
      tipo === 'cliente'
        ? this.domicilioClienteRepo
        : this.domicilioUsuarioRepo;

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
      nuevos.map(async (domicilio) => {
        if ('id' in domicilio && domicilio.id) {
          const existente = existentes.find((d) => d.id === domicilio.id);
          if (existente) {
            await repo.update(existente.id, domicilio);
            Object.assign(existente, domicilio);
            return existente;
          }
        }
        // Nuevo domicilio
        return repo.create(domicilio);
      }),
    );
    return result as T[];
  }
}
