import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Cliente } from 'src/entities/clientes/clientes.entity';
// import { Inventario } from 'src/entities/inventario/inventario.entity';
import { Producto } from 'src/entities/productos/productos.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clientesRepository: Repository<Cliente>,
    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,
    // private readonly inventarioRepository: Repository<Inventario>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async loadInitialData() {
    const initialProductos = this.productosRepository.create([
      {
        codigo: 'HS2047',
        nombre: 'Lavarropas',
        precios: [
          {
            fechaInicio: '2023-07-01',
            precioUnitario: 60000,
          },
        ],
        costos: [
          {
            fechaInicio: '2023-07-01',
            precioUnitario: 30000,
          },
        ],
        /* inventario: {
        }, */
        stock: 5,
      },
      {
        codigo: 'SEC24',
        nombre: 'Secarropas',
        precios: [
          {
            fechaInicio: '2023-07-01',
            precioUnitario: 50000,
          },
        ],
        costos: [
          {
            fechaInicio: '2023-07-01',
            precioUnitario: 25000,
          },
        ],
        /* inventario: {
        }, */
        stock: 5,
      },
      {
        codigo: 'SMTV32',
        nombre: 'Smart TV 32"',
        precios: [
          {
            fechaInicio: '2023-07-01',
            precioUnitario: 90000,
          },
        ],
        costos: [
          {
            fechaInicio: '2023-07-01',
            precioUnitario: 45000,
          },
        ],
        /* inventario: {
        }, */
        stock: 5,
      },
      {
        codigo: 'COCINDU4',
        nombre: 'Cocina industrial 4 hornallas',
        precios: [
          {
            fechaInicio: '2023-07-01',
            precioUnitario: 90000,
          },
        ],
        costos: [
          {
            fechaInicio: '2023-07-01',
            precioUnitario: 45000,
          },
        ],
        /* inventario: {
        }, */
        stock: 5,
      },
    ]);
    await this.productosRepository.save(initialProductos);

    const initialClientes = this.clientesRepository.create([
      {
        nombre: 'Juan',
        apellido: 'Perez',
        dni: 12345678,
        saldo: 0,
        domicilios: [
          {
            direccion: 'Calle 123',
            localidad: 'Buenos Aires',
            barrio: 'Buenos Aires',
          },
        ],
        telefonos: [{ telefono: '12345678' }],
      },
      {
        nombre: 'Pedro',
        apellido: 'Garcia',
        dni: 87654321,
        saldo: 0,
        domicilios: [
          {
            direccion: 'Calle 123',
            localidad: 'Buenos Aires',
            barrio: 'Buenos Aires',
          },
        ],
      },
      {
        nombre: 'Juan',
        apellido: 'Gimenez',
        dni: 12345638,
        saldo: 0,
        domicilios: [
          {
            direccion: 'Calle 123',
            localidad: 'Buenos Aires',
            barrio: 'Buenos Aires',
          },
        ],
      },
    ]);
    await this.clientesRepository.save(initialClientes);

    return { message: 'Initial data loaded' };
  }
}
