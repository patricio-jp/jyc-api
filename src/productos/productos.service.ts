import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
//import { Inventario } from 'src/entities/inventario/inventario.entity';
import { CreatePrecioDTO } from 'src/entities/precios/precios.dto';
import { Costo, Precio } from 'src/entities/precios/precios.entity';
import {
  CreateProductoDTO,
  ModifyProductoPrecioDTO,
} from 'src/entities/productos/productos.dto';
import { Producto } from 'src/entities/productos/productos.entity';
import { Repository } from 'typeorm';

enum ProductModifications {
  Precio,
  Costo,
}

@Injectable()
export class ProductosService {
  constructor(
    @InjectRepository(Producto)
    private productosRepository: Repository<Producto>,
    /* @InjectRepository(Inventario)
    private inventarioRepository: Repository<Inventario>, */
    @InjectRepository(Precio)
    private preciosRepository: Repository<Precio>,
    @InjectRepository(Costo)
    private costosRepository: Repository<Costo>,
  ) {}

  async create(createProductoDto: CreateProductoDTO) {
    try {
      const { codigo, nombre, costos, precios, stock } = createProductoDto;

      const existent = await this.productosRepository.findOneBy({ codigo });

      if (existent) return 'Ya existe un producto con el código ingresado';

      const nuevoProducto = new Producto();
      nuevoProducto.codigo = codigo;
      nuevoProducto.nombre = nombre;
      nuevoProducto.stock = stock;

      await nuevoProducto.save();

      if (costos) {
        const nuevosCostos = [];
        for (const cost of costos) {
          const nuevoCosto = new Costo();
          nuevoCosto.fechaInicio = new Date(cost.fechaInicio.valueOf());
          nuevoCosto.fechaFin = cost.fechaFin
            ? new Date(cost.fechaFin.valueOf())
            : null;
          nuevoCosto.precioUnitario = cost.precioUnitario;

          nuevosCostos.push(nuevoCosto);
        }
        nuevoProducto.costos = nuevosCostos;
      }

      if (precios) {
        const nuevosPrecios = await Promise.all(
          precios.map(async (precio: CreatePrecioDTO) => {
            const nuevoPrecio = new Precio();
            nuevoPrecio.fechaInicio = new Date(precio.fechaInicio.valueOf());
            nuevoPrecio.precioUnitario = precio.precioUnitario;
            nuevoPrecio.fechaFin = precio.fechaFin
              ? new Date(precio.fechaFin.valueOf())
              : null;

            return nuevoPrecio;
          }),
        );
        nuevoProducto.precios = nuevosPrecios;
      }

      /* const inventario = this.inventarioRepository.create();
      inventario.stock = stock;
      nuevoProducto.inventario = inventario; */

      return await this.productosRepository.save(nuevoProducto);
    } catch (error) {
      console.error(error);
      return `Error: ${error}`;
    }
  }

  async findAll(): Promise<[Producto[], number]> {
    return await this.productosRepository.findAndCount();
  }

  async findOne(id: number) {
    return await this.productosRepository.findOneBy({ id });
  }

  /* async update(id: number, updateProductoDto: UpdateProductoDto) {
    return `This action updates a #${id} producto`;
  } */

  async modificarPrecioCosto(
    id: number,
    data: ModifyProductoPrecioDTO,
    modify: ProductModifications,
  ) {
    const producto = await this.productosRepository.findOneBy({ id });

    if (!producto) return 'No existe el producto con el ID buscado';

    const { fechaInicio, precioUnitario, fechaFin } = data;

    if (modify === ProductModifications.Precio) {
      const ultimoPrecio = await this.preciosRepository.findOneBy({
        id_producto: id,
        fechaFin: null,
      });
      ultimoPrecio.fechaFin = fechaInicio;
      await this.preciosRepository.save(ultimoPrecio);
      const nuevoPrecio = new Precio();
      nuevoPrecio.id_producto = id;
      nuevoPrecio.fechaInicio = fechaInicio;
      nuevoPrecio.precioUnitario = precioUnitario;
      nuevoPrecio.fechaFin = fechaFin;
      return await this.preciosRepository.insert(nuevoPrecio);
    } else {
      const ultimoCosto = await this.costosRepository.findOneBy({
        id_producto: id,
        fechaFin: null,
      });
      ultimoCosto.fechaFin = fechaInicio;
      await this.costosRepository.save(ultimoCosto);
      const nuevoCosto = new Precio();
      nuevoCosto.id_producto = id;
      nuevoCosto.fechaInicio = fechaInicio;
      nuevoCosto.precioUnitario = precioUnitario;
      nuevoCosto.fechaFin = fechaFin;
      return await this.costosRepository.insert(nuevoCosto);
    }
  }

  async softRemove(id: number) {
    try {
      const producto = await this.productosRepository.findOneBy({ id });
      if (!producto) return 'No existe el producto con el ID buscado';

      return await this.productosRepository.softRemove(producto);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async remove(id: number) {
    try {
      const producto = await this.productosRepository.findOneBy({ id });
      if (!producto) return 'No existe el producto con el ID buscado';

      return await this.productosRepository.remove(producto);
    } catch (error) {
      return `Error: ${error}`;
    }
  }
}
