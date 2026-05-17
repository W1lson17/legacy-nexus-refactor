import type { Supplier } from '../entities/Supplier.js';

export interface SupplierRepository {
  findAll(): Promise<Supplier[]>;
  findById(id: number): Promise<Supplier | null>;
}