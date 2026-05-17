import type { PrismaClient } from '../../generated/prisma/client.js';
import type { UserRepository } from '../../domain/ports/UserRepository.js';
import type { User } from '../../domain/entities/User.js';
import { User as UserEntity } from '../../domain/entities/User.js';

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByUsername(username: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { username } });
    if (!row) return null;
    return UserEntity.fromPrisma(row);
  }

  async findById(id: number): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    if (!row) return null;
    return UserEntity.fromPrisma(row);
  }

  async findAll(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      orderBy: { id: 'asc' },
    });
    return rows.map((row) => UserEntity.fromPrisma(row));
  }
}