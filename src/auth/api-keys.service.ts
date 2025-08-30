import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKey } from 'src/entities/api-keys/api-key.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class ApiKeysService {
  constructor(
    @InjectRepository(ApiKey)
    private apiKeysRepository: Repository<ApiKey>,
  ) {}

  // Expect incomingKey like "publicId.rawSecret" or just rawSecret for backward compatibility
  async validateApiKey(incomingKey: string) {
    if (!incomingKey) throw new UnauthorizedException('No API key provided');

    const parts = incomingKey.split('.');
    let publicId: string | undefined;
    let rawSecret: string;
    if (parts.length >= 2) {
      publicId = parts[0];
      rawSecret = parts.slice(1).join('.');
    } else {
      // legacy: try all (slow path)
      rawSecret = incomingKey;
    }

    if (publicId) {
      const candidate = await this.apiKeysRepository.findOne({
        where: { publicId },
        select: [
          'id',
          'publicId',
          'name',
          'hashedSecret',
          'rol',
          'revoked',
          'expiresAt',
        ],
      } as any);
      if (!candidate || candidate.revoked)
        throw new UnauthorizedException('Invalid API key');
      if (candidate.expiresAt && candidate.expiresAt < new Date())
        throw new UnauthorizedException('API key expired');

      const match = await bcrypt.compare(rawSecret, candidate.hashedSecret);
      if (match) {
        return {
          id: candidate.id,
          publicId: candidate.publicId,
          name: candidate.name,
          rol: candidate.rol,
        };
      }
      throw new UnauthorizedException('Invalid API key');
    }

    // Fallback (legacy): compare against all (only if no publicId provided)
    const candidates = await this.apiKeysRepository.find({
      where: { revoked: false },
      select: ['id', 'publicId', 'name', 'hashedSecret', 'rol', 'expiresAt'],
    } as any);
    for (const candidate of candidates) {
      if (candidate.expiresAt && candidate.expiresAt < new Date()) continue;
      const match = await bcrypt.compare(rawSecret, candidate.hashedSecret);
      if (match) {
        return {
          id: candidate.id,
          publicId: candidate.publicId,
          name: candidate.name,
          rol: candidate.rol,
        };
      }
    }
    throw new UnauthorizedException('Invalid API key');
  }

  // Create API key with format publicId.rawSecret; returns { publicId, rawSecret } (rawSecret must be shown once)
  async createApiKey(name: string, rol: number, ttlDays = 365) {
    const rawSecret = (
      Math.random().toString(36).slice(2) + Date.now().toString(36)
    ).slice(0, 40);
    const publicId = (
      Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
    ).slice(0, 12);
    const hashedSecret = await bcrypt.hash(rawSecret, 10);
    const expiresAt =
      ttlDays > 0 ? new Date(Date.now() + ttlDays * 24 * 60 * 60 * 1000) : null;
    const apiKey = this.apiKeysRepository.create({
      name,
      publicId,
      hashedSecret,
      rol,
      expiresAt,
    });
    const saved = await this.apiKeysRepository.save(apiKey);
    return {
      id: saved.id,
      publicId: saved.publicId,
      rawSecret,
      name: saved.name,
      rol: saved.rol,
      expiresAt: saved.expiresAt,
    };
  }

  async listApiKeys() {
    return this.apiKeysRepository.find({
      select: [
        'id',
        'publicId',
        'name',
        'rol',
        'revoked',
        'expiresAt',
        'createdAt',
      ],
    } as any);
  }

  async revokeApiKey(publicId: string) {
    const api = await this.apiKeysRepository.findOneBy({ publicId } as any);
    if (!api) throw new Error('ApiKey not found');
    api.revoked = true;
    return this.apiKeysRepository.save(api);
  }
}
