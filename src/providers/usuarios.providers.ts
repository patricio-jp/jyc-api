import { DATA_SOURCE, USUARIOS_REPOSITORY } from 'src/constants/constants';
import { Usuario } from 'src/entities/usuarios/usuarios.entity';
import { DataSource } from 'typeorm';

export const usuariosProviders = [
  {
    provide: USUARIOS_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Usuario),
    inject: [DATA_SOURCE],
  },
];
