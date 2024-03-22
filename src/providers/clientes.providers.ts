import { CLIENTES_REPOSITORY, DATA_SOURCE } from 'src/constants/constants';
import { Cliente } from 'src/entities/clientes/clientes.entity';
import { DataSource } from 'typeorm';

export const clientesProviders = [
  {
    provide: CLIENTES_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Cliente),
    inject: [DATA_SOURCE],
  },
];
