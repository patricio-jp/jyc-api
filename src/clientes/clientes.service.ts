import { Inject, Injectable } from '@nestjs/common';
import {
  CreateClienteDTO,
  UpdateClienteDTO,
} from 'src/entities/clientes/clientes.dto';
import { CLIENTES_REPOSITORY } from 'src/constants/constants';
import { Repository } from 'typeorm';
import { Cliente } from 'src/entities/clientes/clientes.entity';

@Injectable()
export class ClientesService {
  constructor(
    @Inject(CLIENTES_REPOSITORY)
    private clientesRepository: Repository<Cliente>,
  ) {}

  create(createClienteDto: CreateClienteDTO) {
    return 'This action adds a new cliente';
  }

  async findAll(): Promise<[Cliente[], number]> {
    return this.clientesRepository.findAndCount();
  }

  findOne(id: number) {
    return `This action returns a #${id} cliente`;
  }

  update(id: number, updateClienteDto: UpdateClienteDTO) {
    return `This action updates a #${id} cliente`;
  }

  remove(id: number) {
    return `This action removes a #${id} cliente`;
  }
}
