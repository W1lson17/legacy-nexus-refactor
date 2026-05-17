import type { PrismaClient } from '../../generated/prisma/client.js';
import type { WarehouseRepository } from '../../domain/ports/WarehouseRepository.js';
import { Warehouse } from '../../domain/entities/Warehouse.js';

export class PrismaWarehouseRepository implements WarehouseRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Warehouse[]> {
    const rows = await this.prisma.warehouse.findMany({
      orderBy: { id: 'asc' },
    });
    return rows.map((row) =>
      Warehouse.fromPrisma({
        id: row.id,
        name: row.name,
        region: row.region,
      }),
    );
  }

  async findById(id: number): Promise<Warehouse | null> {
    const row = await this.prisma.warehouse.findUnique({ where: { id } });
    if (!row) return null;
    return Warehouse.fromPrisma({
      id: row.id,
      name: row.name,
      region: row.region,
    });
  }
}