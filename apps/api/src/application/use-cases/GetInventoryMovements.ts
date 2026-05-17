import type { InventoryRepository } from '../../domain/ports/InventoryRepository.js';
import type { InventoryMovement } from '../../domain/entities/InventoryMovement.js';
import type { MovementType } from '../../domain/entities/InventoryMovement.js';

export class GetInventoryMovements {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  async execute(input: GetInventoryMovements.Input): Promise<GetInventoryMovements.Output> {
    return this.inventoryRepo.getMovements({
      productId: input.productId,
      warehouseId: input.warehouseId,
      type: input.type,
      page: input.page,
      limit: input.limit,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetInventoryMovements {
  export interface Input {
    productId?: number;
    warehouseId?: number;
    type?: MovementType;
    page: number;
    limit: number;
  }

  export interface Output {
    movements: InventoryMovement[];
    total: number;
  }
}