import type { PrismaClient } from '../../generated/prisma/client.js';
import type { ProductRepository, ProductFindAllParams, ProductSearchParams } from '../../domain/ports/ProductRepository.js';
import { Product } from '../../domain/entities/Product.js';

export class PrismaProductRepository implements ProductRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: number): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({
      where: { id },
    });
    if (!row || row.deletedAt !== null) return null;
    return this.toEntity(row);
  }

  async findBySku(sku: string): Promise<Product | null> {
    const row = await this.prisma.product.findUnique({
      where: { sku },
    });
    if (!row || row.deletedAt !== null) return null;
    return this.toEntity(row);
  }

  async findAll(params: ProductFindAllParams): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const where = {
      deletedAt: null as Date | null,
      ...(params.category ? { category: params.category } : {}),
    };

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / params.limit);

    return {
      products: rows.map((row) => this.toEntity(row)),
      total,
      page: params.page,
      totalPages,
    };
  }

  async search(params: ProductSearchParams): Promise<{ products: Product[]; total: number }> {
    const where = {
      deletedAt: null as Date | null,
      OR: [
        { sku: { contains: params.query } },
        { name: { contains: params.query } },
      ],
    };

    const [rows, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { id: 'asc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      products: rows.map((row) => this.toEntity(row)),
      total,
    };
  }

  async save(product: Product): Promise<Product> {
    const data = {
      sku: product.sku,
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      supplierId: product.supplierId,
      deletedAt: product.deletedAt,
    };

    if (product.id === 0) {
      // Create new product
      const row = await this.prisma.product.create({ data });
      return this.toEntity(row);
    }

    // Update existing product
    const row = await this.prisma.product.update({
      where: { id: product.id },
      data,
    });
    return this.toEntity(row);
  }

  async softDelete(id: number): Promise<void> {
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  private toEntity(
    row: {
      id: number;
      sku: string;
      name: string;
      description: string | null;
      price: { toString(): string } | number;
      category: string | null;
      supplierId: number | null;
      createdAt: Date;
      updatedAt: Date;
      deletedAt: Date | null;
    },
  ): Product {
    return Product.fromPrisma(row);
  }
}