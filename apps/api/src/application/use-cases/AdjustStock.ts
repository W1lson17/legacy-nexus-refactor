import type { InventoryRepository } from '../../domain/ports/InventoryRepository.js';
import type { InventoryMovement } from '../../domain/entities/InventoryMovement.js';
import type { MovementType } from '../../domain/entities/InventoryMovement.js';

export class AdjustStock {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  async execute(input: AdjustStock.Input): Promise<AdjustStock.Output> {
    const movement = await this.inventoryRepo.adjustStock({
      productId: input.productId,
      warehouseId: input.warehouseId,
      qty: input.qty,
      type: input.type,
      refId: input.refId,
    });

    return { movement };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace AdjustStock {
  export interface Input {
    productId: number;
    warehouseId: number;
    qty: number;
    type: MovementType;
    refId?: number;
  }

  export interface Output {
    movement: InventoryMovement;
  }
}