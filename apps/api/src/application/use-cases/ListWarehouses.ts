import type { WarehouseRepository } from '../../domain/ports/WarehouseRepository.js';
import type { Warehouse } from '../../domain/entities/Warehouse.js';

export class ListWarehouses {
  constructor(private readonly warehouseRepo: WarehouseRepository) {}

  async execute(): Promise<ListWarehouses.Output> {
    const warehouses = await this.warehouseRepo.findAll();
    return { warehouses };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ListWarehouses {
  export interface Output {
    warehouses: Warehouse[];
  }
}