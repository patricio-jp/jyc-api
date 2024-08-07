import { Injectable } from '@nestjs/common';
import {
  CreateClienteDTO,
  UpdateClienteDTO,
} from 'src/entities/clientes/clientes.dto';
import { Repository } from 'typeorm';
import { Cliente, EstadoCliente } from 'src/entities/clientes/clientes.entity';
import { CreateDomicilioDTO } from 'src/entities/domicilios/domicilios.dto';
import { DomicilioCliente } from 'src/entities/domicilios/domicilios.entity';
import { CreateTelefonoDTO } from 'src/entities/telefonos/telefonos.dto';
import { TelefonoCliente } from 'src/entities/telefonos/telefonos.entity';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private clientesRepository: Repository<Cliente>,
    @InjectRepository(Usuario)
    private usuariosRepository: Repository<Usuario>,
  ) {}

  async create(createClienteDto: CreateClienteDTO) {
    try {
      const {
        nombre,
        apellido,
        dni,
        fechaNacimiento,
        domicilios,
        telefonos,
        id_vendedorAsociado,
        vendedorAsociadoHasta,
        id_cobradorAsociado,
        saldo,
        observaciones,
        estado,
      } = createClienteDto;

      const existent = await this.clientesRepository.findOneBy({
        dni,
      });
      if (existent) return 'Ya existe un cliente con el DNI ingresado';

      const nuevoCliente = new Cliente();
      nuevoCliente.nombre = nombre;
      nuevoCliente.apellido = apellido;
      nuevoCliente.dni = dni;
      nuevoCliente.fechaNacimiento = fechaNacimiento;
      nuevoCliente.saldo = saldo ? saldo : 0;
      nuevoCliente.observaciones = observaciones;
      nuevoCliente.estado = estado ? estado : EstadoCliente.AConfirmar;

      if (domicilios) {
        const nuevosDomicilios = await Promise.all(
          domicilios.map(async (domicilio: CreateDomicilioDTO) => {
            const nuevoDom = new DomicilioCliente();
            nuevoDom.direccion = domicilio.direccion;
            nuevoDom.barrio = domicilio.barrio;
            nuevoDom.localidad = domicilio.localidad;

            return nuevoDom;
          }),
        );
        nuevoCliente.domicilios = nuevosDomicilios;
      }

      if (telefonos) {
        const nuevosTelefonos = await Promise.all(
          telefonos.map(async (telefono: CreateTelefonoDTO) => {
            const nuevoTel = new TelefonoCliente();
            nuevoTel.telefono = telefono.telefono;

            return nuevoTel;
          }),
        );
        nuevoCliente.telefonos = nuevosTelefonos;
      }

      if (id_vendedorAsociado) {
        nuevoCliente.id_vendedorAsociado = id_vendedorAsociado;
        nuevoCliente.vendedorAsociadoHasta = vendedorAsociadoHasta;
      }

      if (id_cobradorAsociado) {
        nuevoCliente.id_cobradorAsociado = id_cobradorAsociado;
      }

      return await this.usuariosRepository.insert(nuevoCliente);
    } catch (error) {
      console.error(error);
      return `Error: ${error}`;
    }
  }

  async findAll(): Promise<[Cliente[], number]> {
    return await this.clientesRepository.findAndCount();
  }

  async findOne(id: number) {
    return await this.clientesRepository.findOneBy({ id });
  }

  async update(id: number, updateClienteDto: UpdateClienteDTO) {
    try {
      const cliente = await this.clientesRepository.findOneBy({ id });

      if (!cliente) return 'No existe el cliente con el ID ingresado';

      const {
        nombre,
        apellido,
        dni,
        fechaNacimiento,
        domicilios,
        telefonos,
        id_vendedorAsociado,
        vendedorAsociadoHasta,
        id_cobradorAsociado,
        saldo,
        observaciones,
        estado,
      } = updateClienteDto;

      if (nombre) cliente.nombre = nombre;
      cliente.apellido = apellido;
      if (dni) cliente.dni = dni;
      cliente.fechaNacimiento = fechaNacimiento;
      if (saldo) cliente.saldo = saldo;
      cliente.observaciones = observaciones;
      if (estado) cliente.estado = estado;

      if (domicilios) {
        domicilios.map(async (domicilio: CreateDomicilioDTO) => {
          const nuevoDom = new DomicilioCliente();
          nuevoDom.direccion = domicilio.direccion;
          nuevoDom.barrio = domicilio.barrio;
          nuevoDom.localidad = domicilio.localidad;

          cliente.domicilios = [...(cliente.domicilios || []), nuevoDom];
          return;
        });
      }

      if (telefonos) {
        telefonos.map(async (telefono: CreateTelefonoDTO) => {
          const nuevoTel = new TelefonoCliente();
          nuevoTel.telefono = telefono.telefono;

          cliente.telefonos = [...(cliente.telefonos || []), nuevoTel];
          return;
        });
      }

      if (id_vendedorAsociado) {
        cliente.id_vendedorAsociado = id_vendedorAsociado;
        cliente.vendedorAsociadoHasta = vendedorAsociadoHasta;
      }

      if (id_cobradorAsociado) {
        cliente.id_cobradorAsociado = id_cobradorAsociado;
      }

      return await this.clientesRepository.save(cliente);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async softRemove(id: number) {
    try {
      const cliente = await this.clientesRepository.findOneBy({ id });
      if (!cliente) return 'No existe el cliente con el ID ingresado';

      return await this.clientesRepository.softRemove(cliente);
    } catch (error) {
      return `Error: ${error}`;
    }
  }

  async remove(id: number) {
    try {
      const cliente = await this.clientesRepository.findOneBy({ id });
      if (!cliente) return 'No existe el cliente con el ID ingresado';

      return await this.clientesRepository.remove(cliente);
    } catch (error) {
      return `Error: ${error}`;
    }
  }
}
