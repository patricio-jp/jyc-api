import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Rol } from '../usuarios/usuarios.entity';

@Entity('api_keys')
export class ApiKey extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  // Public identifier usable for lookup (short string)
  @Column({ unique: true })
  publicId: string;

  @Column()
  name: string;

  // Hashed secret (never returned)
  @Column({ select: false })
  hashedSecret: string;

  @Column({ type: 'enum', enum: Rol, default: Rol.Vendedor })
  rol: Rol;

  @Column({ default: false })
  revoked: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date | null;

  @CreateDateColumn()
  createdAt: Date;
}
