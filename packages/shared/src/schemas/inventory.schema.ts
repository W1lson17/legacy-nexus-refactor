import { z } from 'zod';

export const inventoryAdjustSchema = z.object({
  productId: z.number().int(),
  warehouseId: z.number().int(),
  qty: z.number().int(),
  type: z.enum(['IN', 'OUT', 'ADJUST', 'SALE', 'PURCHASE', 'RETURN']),
  refId: z.number().int().optional(),
});

export type InventoryAdjustInput = z.infer<typeof inventoryAdjustSchema>;

export type InventoryMovement = {
  id: number;
  productId: number;
  warehouseId: number;
  qty: number;
  type: string;
  refId: number | null;
  ts: string;
};

export type SupplierOutput = {
  id: number;
  name: string;
  contact: string | null;
  country: string | null;
};

export type WarehouseOutput = {
  id: number;
  name: string;
  region: string | null;
};