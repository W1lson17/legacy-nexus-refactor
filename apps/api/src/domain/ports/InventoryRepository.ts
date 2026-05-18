import type { InventoryStock } from '../entities/InventoryStock.js';
import type { InventoryMovement, MovementType } from '../entities/InventoryMovement.js';

export interface InventoryGetStockParams {
  warehouseId?: number;
  page: number;
  limit: number;
}

export interface InventoryGetMovementsParams {
  productId?: number;
  warehouseId?: number;
  type?: MovementType;
  page: number;
  limit: number;
}

export interface InventoryRepository {
  getStock(params: InventoryGetStockParams): Promise<{ items: { product: unknown; warehouse: unknown; quantity: number }[]; total: number }>;
  adjustStock(params: { productId: number; warehouseId: number; qty: number; type: MovementType; refId?: number }): Promise<InventoryMovement>;
  getMovements(params: InventoryGetMovementsParams): Promise<{ movements: InventoryMovement[]; total: number }>;
}