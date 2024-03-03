import { Inject, Injectable } from '@nestjs/common';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';
import { CLIENTES_REPOSITORY } from 'src/constants/constants';
import { Repository } from 'typeorm';
import { Cliente } from 'src/entities/clientes.entity';

@Injectable()
export class ClientesService {
  constructor(
    @Inject(CLIENTES_REPOSITORY)
    private clientesRepository: Repository<Cliente>,
  ) {}

  create(createClienteDto: CreateClienteDto) {
    return 'This action adds a new cliente';
  }

  async findAll(): Promise<[Cliente[], number]> {
    return this.clientesRepository.findAndCount();
  }

  findOne(id: number) {
    return `This action returns a #${id} cliente`;
  }

  update(id: number, updateClienteDto: UpdateClienteDto) {
    return `This action updates a #${id} cliente`;
  }

  remove(id: number) {
    return `This action removes a #${id} cliente`;
  }
}
