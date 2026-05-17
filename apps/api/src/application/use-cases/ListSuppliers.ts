import type { SupplierRepository } from '../../domain/ports/SupplierRepository.js';
import type { Supplier } from '../../domain/entities/Supplier.js';

export class ListSuppliers {
  constructor(private readonly supplierRepo: SupplierRepository) {}

  async execute(): Promise<ListSuppliers.Output> {
    const suppliers = await this.supplierRepo.findAll();
    return { suppliers };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ListSuppliers {
  export interface Output {
    suppliers: Supplier[];
  }
}