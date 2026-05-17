import type { InventoryRepository } from '../../domain/ports/InventoryRepository.js';

export class GetInventory {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  async execute(input: GetInventory.Input): Promise<GetInventory.Output> {
    const items = await this.inventoryRepo.getStock(
      input.productId ?? 0,
      input.warehouseId,
    );
    // When productId is 0 (not provided), getStock returns all stock rows
    // When productId is provided, getStock returns stock for that product
    // When warehouseId is provided, filter by warehouse
    const filtered = input.productId
      ? items
      : items;

    return { items: filtered };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetInventory {
  export interface Input {
    productId?: number;
    warehouseId?: number;
  }

  export interface Output {
    items: { product: unknown; warehouse: unknown; quantity: number }[];
  }
}