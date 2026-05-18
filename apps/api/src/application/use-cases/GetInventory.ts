import type { InventoryRepository } from '../../domain/ports/InventoryRepository.js';

export class GetInventory {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  async execute(input: GetInventory.Input): Promise<GetInventory.Output> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const { items, total } = await this.inventoryRepo.getStock({
      warehouseId: input.warehouseId,
      page,
      limit,
    });
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetInventory {
  export interface Input {
    warehouseId?: number;
    page?: number;
    limit?: number;
  }

  export interface Output {
    items: { product: unknown; warehouse: unknown; quantity: number }[];
    total: number;
    page: number;
    totalPages: number;
  }
}
