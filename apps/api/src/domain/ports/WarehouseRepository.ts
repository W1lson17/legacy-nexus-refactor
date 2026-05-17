import type { Warehouse } from '../entities/Warehouse.js';

export interface WarehouseRepository {
  findAll(): Promise<Warehouse[]>;
  findById(id: number): Promise<Warehouse | null>;
}