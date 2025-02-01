import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Carton } from 'src/entities/cartones/carton.entity';
import {
  CambiarEstadoCartonDTO,
  CreateCartonDTO,
} from 'src/entities/cartones/cartones.dto';
import { CreateGrupoCartonesDTO } from 'src/entities/cartones/grupoCartones.dto';
import { GrupoCartones } from 'src/entities/cartones/grupoCartones.entity';
import { Credito } from 'src/entities/creditos/creditos.entity';
import { Repository } from 'typeorm';

interface CartonFilter {
  searchTerm?: string;
  mostrarEliminados?: boolean;
}

interface GrupoCartonesFilter {
  searchTerm?: string;
  mostrarEliminados?: boolean;
}

@Injectable()
export class CartonesService {
  constructor(
    @InjectRepository(GrupoCartones)
    private grupoCartonesRepository: Repository<GrupoCartones>,
    @InjectRepository(Carton)
    private cartonesRepository: Repository<Carton>,
    @InjectRepository(Credito)
    private creditosRepository: Repository<Credito>,
  ) {}

  async getAllCartones(page: number, limit: number, filter: CartonFilter) {
    const query = this.cartonesRepository.createQueryBuilder('carton');
    query.leftJoinAndSelect('carton.grupoCartones', 'grupoCartones');
    query.leftJoinAndSelect('carton.credito', 'credito');
    query.leftJoinAndSelect('credito.venta', 'venta');
    query.leftJoinAndSelect('venta.productos', 'detalle');
    query.leftJoinAndSelect('detalle.producto', 'producto');
    query.leftJoinAndSelect('venta.cliente', 'cliente');
    query.leftJoinAndSelect('cliente.telefonos', 'telefonos');
    query.leftJoinAndSelect('cliente.domicilios', 'domicilios');

    if (filter.searchTerm) {
      query.andWhere('(venta.comprobante LIKE :searchTerm)', {
        searchTerm: `%${filter.searchTerm}%`,
      });
    }

    if (filter.mostrarEliminados) {
      query.withDeleted();
    }

    if (limit > 0 && page > 0) query.skip((page - 1) * limit).take(limit);

    return await query.getManyAndCount();
  }

  async getCarton(id: number) {
    const query = this.cartonesRepository.createQueryBuilder('carton');
    query.leftJoinAndSelect('carton.grupoCartones', 'grupoCartones');
    query.leftJoinAndSelect('carton.credito', 'credito');
    query.leftJoinAndSelect('credito.venta', 'venta');
    query.leftJoinAndSelect('venta.productos', 'detalle');
    query.leftJoinAndSelect('detalle.producto', 'producto');
    query.leftJoinAndSelect('venta.cliente', 'cliente');
    query.leftJoinAndSelect('cliente.telefonos', 'telefonos');
    query.leftJoinAndSelect('cliente.domicilios', 'domicilios');

    query.where('carton.id = :id', { id });

    return await query.getOne();
  }

  async getAllGrupos(page: number, limit: number, filter: GrupoCartonesFilter) {
    const query =
      this.grupoCartonesRepository.createQueryBuilder('grupo_cartones');
    query.leftJoinAndSelect('grupo_cartones.cartones', 'cartones');
    query.leftJoinAndSelect('cartones.credito', 'credito');
    query.leftJoinAndSelect('credito.venta', 'venta');
    query.leftJoinAndSelect('venta.productos', 'detalle');
    query.leftJoinAndSelect('detalle.producto', 'producto');
    query.leftJoinAndSelect('venta.cliente', 'cliente');
    query.leftJoinAndSelect('cliente.telefonos', 'telefonos');
    query.leftJoinAndSelect('cliente.domicilios', 'domicilios');

    if (filter.searchTerm) {
      query.andWhere(
        '(grupo_cartones.alias LIKE :searchTerm OR venta.comprobante LIKE :searchTerm)',
        {
          searchTerm: `%${filter.searchTerm}%`,
        },
      );
    }

    if (filter.mostrarEliminados) {
      query.withDeleted();
    }

    if (limit > 0 && page > 0) query.skip((page - 1) * limit).take(limit);

    return await query.getManyAndCount();
  }

  async getGrupoCartones(id: number) {
    const query =
      this.grupoCartonesRepository.createQueryBuilder('grupo_cartones');
    query.leftJoinAndSelect('grupo_cartones.cartones', 'cartones');
    query.leftJoinAndSelect('cartones.credito', 'credito');
    query.leftJoinAndSelect('credito.venta', 'venta');
    query.leftJoinAndSelect('venta.productos', 'detalle');
    query.leftJoinAndSelect('detalle.producto', 'producto');
    query.leftJoinAndSelect('venta.cliente', 'cliente');
    query.leftJoinAndSelect('cliente.telefonos', 'telefonos');
    query.leftJoinAndSelect('cliente.domicilios', 'domicilios');

    query.where('grupo_cartones.id = :id', { id });

    return await query.getOne();
  }

  async nuevoCarton(carton: CreateCartonDTO) {
    try {
      const { estado, fechaCarton, id_credito, id_grupoCartones } = carton;

      const credito = await this.creditosRepository.findOneBy({
        id: id_credito,
      });

      if (!credito) return 'No existe el crédito con el ID ingresado';

      const nuevoCarton = new Carton();
      nuevoCarton.estado = estado;
      nuevoCarton.fechaCarton = fechaCarton;
      nuevoCarton.credito = credito;

      const grupoCarton = await this.grupoCartonesRepository.findOneBy({
        id: id_grupoCartones,
      });

      if (grupoCarton) nuevoCarton.grupoCartones = grupoCarton;

      return await nuevoCarton.save();
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async nuevoGrupoCartones(grupo: CreateGrupoCartonesDTO) {
    try {
      const { alias } = grupo;
      const nuevoGrupoCartones = new GrupoCartones();

      nuevoGrupoCartones.alias = alias;

      return await nuevoGrupoCartones.save();
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async updateGrupoCartones(id: number, grupo: CreateGrupoCartonesDTO) {
    try {
      const grupoCartones = await this.grupoCartonesRepository.findOneBy({
        id,
      });

      if (!grupoCartones) return 'No existe el grupo con el ID ingresado';

      const { alias } = grupo;
      grupoCartones.alias = alias;

      return await grupoCartones.save();
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async asignarCartonAGrupo(idCarton: number, idGrupo: number) {
    try {
      const carton = await this.cartonesRepository.findOneBy({
        id: idCarton,
      });
      if (!carton) return 'No existe el cartón con el ID ingresado';

      const grupo = await this.grupoCartonesRepository.findOneBy({
        id: idGrupo,
      });
      if (!grupo) return 'No existe el grupo con el ID ingresado';

      carton.grupoCartones = grupo;

      return await carton.save();
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async eliminarCartonDeGrupo(id: number) {
    try {
      const carton = await this.cartonesRepository.findOne({
        where: { id },
        relations: {
          grupoCartones: true,
        },
      });
      if (!carton) return 'No existe el cartón con el ID ingresado';

      carton.grupoCartones = null;

      return await carton.save();
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async cambiarEstadoCarton(id: number, estadoCarton: CambiarEstadoCartonDTO) {
    try {
      const carton = await this.cartonesRepository.findOneBy({ id });

      if (!carton) return 'No existe el cartón con el ID ingresado';

      const { estado, fechaCarton, actualizarGrupo } = estadoCarton;

      if (actualizarGrupo) {
        const grupoCartones = carton.grupoCartones;
        grupoCartones.cartones.forEach((carton) => {
          carton.estado = estado;
          carton.fechaCarton = fechaCarton ? fechaCarton : new Date();
        });

        return await this.cartonesRepository.save(grupoCartones.cartones);
      } else {
        carton.estado = estado;
        carton.fechaCarton = fechaCarton ? fechaCarton : new Date();

        return await carton.save();
      }
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async deleteCarton(id: number) {
    try {
      const carton = await this.cartonesRepository.findOneBy({ id });
      if (!carton) return 'No existe el cartón con el ID ingresado';

      return await this.cartonesRepository.remove(carton);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async deleteGrupoCartones(id: number) {
    try {
      const grupo = await this.grupoCartonesRepository.findOneBy({ id });
      if (!grupo) return 'No existe el grupo con el ID ingresado';

      return await this.grupoCartonesRepository.remove(grupo);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async restoreCarton(id: number) {
    try {
      const carton = await this.cartonesRepository.findOne({
        where: { id },
        withDeleted: true,
      });
      if (!carton) return 'No existe el cartón con el ID ingresado';

      return await carton.recover();
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async restoreGrupoCartones(id: number) {
    try {
      const grupo = await this.grupoCartonesRepository.findOne({
        where: { id },
        withDeleted: true,
      });
      if (!grupo) return 'No existe el grupo con el ID ingresado';

      return await grupo.recover();
    } catch (error) {
      return `Error: ${error}`;
    }
  }
}
