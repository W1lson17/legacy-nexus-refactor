import type { PrismaClient } from '../../generated/prisma/client.js';
import type { InventoryRepository, InventoryGetMovementsParams } from '../../domain/ports/InventoryRepository.js';
import { InventoryStock } from '../../domain/entities/InventoryStock.js';
import { InventoryMovement } from '../../domain/entities/InventoryMovement.js';
import type { MovementType } from '../../domain/entities/InventoryMovement.js';
import { DomainError } from '../../domain/errors.js';

export class PrismaInventoryRepository implements InventoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async getStock(
    productId: number,
    warehouseId?: number,
  ): Promise<{ product: unknown; warehouse: unknown; quantity: number }[]> {
    const where: Record<string, unknown> = {};
    if (productId && productId !== 0) {
      where.productId = productId;
    }
    if (warehouseId !== undefined) {
      where.warehouseId = warehouseId;
    }

    const rows = await this.prisma.inventoryStock.findMany({
      where,
      include: { product: true, warehouse: true },
    });

    return rows.map((row) => ({
      product: {
        id: (row.product as Record<string, unknown>).id,
        sku: (row.product as Record<string, unknown>).sku,
        name: (row.product as Record<string, unknown>).name,
        price: (row.product as Record<string, unknown>).price,
        category: (row.product as Record<string, unknown>).category,
      },
      warehouse: {
        id: (row.warehouse as Record<string, unknown>).id,
        name: (row.warehouse as Record<string, unknown>).name,
        region: (row.warehouse as Record<string, unknown>).region,
      },
      quantity: row.quantity,
    }));
  }

  async adjustStock(params: {
    productId: number;
    warehouseId: number;
    qty: number;
    type: MovementType;
    refId?: number;
  }): Promise<InventoryMovement> {
    return this.prisma.$transaction(async (tx) => {
      // 1. Find or create stock record
      let stock = await tx.inventoryStock.findUnique({
        where: {
          productId_warehouseId: {
            productId: params.productId,
            warehouseId: params.warehouseId,
          },
        },
      });

      if (!stock) {
        stock = await tx.inventoryStock.create({
          data: {
            productId: params.productId,
            warehouseId: params.warehouseId,
            quantity: 0,
          },
        });
      }

      // 2. Validate — no negative stock for OUT movements
      const stockEntity = InventoryStock.fromPrisma({
        productId: stock.productId,
        warehouseId: stock.warehouseId,
        quantity: stock.quantity,
      });

      try {
        const adjusted = stockEntity.adjust(params.qty);
        // 3. Update stock
        await tx.inventoryStock.update({
          where: {
            productId_warehouseId: {
              productId: params.productId,
              warehouseId: params.warehouseId,
            },
          },
          data: { quantity: adjusted.quantity },
        });
      } catch (e) {
        if (e instanceof DomainError) {
          throw e;
        }
        throw e;
      }

      // 4. Create movement record
      const movement = await tx.inventoryMovement.create({
        data: {
          productId: params.productId,
          warehouseId: params.warehouseId,
          qty: params.qty,
          type: params.type,
          refId: params.refId ?? null,
        },
      });

      // 5. Return movement
      return InventoryMovement.fromPrisma({
        id: movement.id,
        productId: movement.productId,
        warehouseId: movement.warehouseId,
        qty: movement.qty,
        type: movement.type,
        refId: movement.refId,
        ts: movement.ts,
      });
    });
  }

  async getMovements(
    params: InventoryGetMovementsParams,
  ): Promise<{ movements: InventoryMovement[]; total: number }> {
    const where: Record<string, unknown> = {};
    if (params.productId !== undefined) where.productId = params.productId;
    if (params.warehouseId !== undefined) where.warehouseId = params.warehouseId;
    if (params.type !== undefined) where.type = params.type;

    const [rows, total] = await Promise.all([
      this.prisma.inventoryMovement.findMany({
        where,
        skip: (params.page - 1) * params.limit,
        take: params.limit,
        orderBy: { ts: 'desc' },
      }),
      this.prisma.inventoryMovement.count({ where }),
    ]);

    return {
      movements: rows.map((row) =>
        InventoryMovement.fromPrisma({
          id: row.id,
          productId: row.productId,
          warehouseId: row.warehouseId,
          qty: row.qty,
          type: row.type,
          refId: row.refId,
          ts: row.ts,
        }),
      ),
      total,
    };
  }
}