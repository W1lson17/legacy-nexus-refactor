import type { PrismaClient } from '../../generated/prisma/client.js';
import type { SupplierRepository } from '../../domain/ports/SupplierRepository.js';
import { Supplier } from '../../domain/entities/Supplier.js';

export class PrismaSupplierRepository implements SupplierRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(): Promise<Supplier[]> {
    const rows = await this.prisma.supplier.findMany({
      orderBy: { id: 'asc' },
    });
    return rows.map((row) =>
      Supplier.fromPrisma({
        id: row.id,
        name: row.name,
        contact: row.contact,
        country: row.country,
      }),
    );
  }

  async findById(id: number): Promise<Supplier | null> {
    const row = await this.prisma.supplier.findUnique({ where: { id } });
    if (!row) return null;
    return Supplier.fromPrisma({
      id: row.id,
      name: row.name,
      contact: row.contact,
      country: row.country,
    });
  }
}