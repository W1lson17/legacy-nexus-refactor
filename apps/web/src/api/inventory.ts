import { api } from '../lib/axios';
import type { InventoryAdjustInput, InventoryMovement, SupplierOutput, WarehouseOutput } from '@legacy/shared';

export interface InventoryItem {
  product: { id: number; name: string; sku: string };
  warehouse: { id: number; name: string; region: string | null };
  quantity: number;
}

export interface PaginatedInventory {
  items: InventoryItem[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PaginatedMovements {
  movements: InventoryMovement[];
  total: number;
  page: number;
  totalPages: number;
}

export const inventoryApi = {
  list: async (
    page = 1,
    limit = 20,
    warehouseId?: number,
  ): Promise<PaginatedInventory> => {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (warehouseId) params.warehouseId = String(warehouseId);
    const { data } = await api.get('/api/inventory', { params });
    return data;
  },

  adjust: async (input: InventoryAdjustInput): Promise<InventoryMovement> => {
    const { data } = await api.post('/api/inventory/adjust', input);
    return data.movement;
  },

  getMovements: async (
    productId?: number,
    warehouseId?: number,
    type?: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedMovements> => {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (productId) params.productId = String(productId);
    if (warehouseId) params.warehouseId = String(warehouseId);
    if (type) params.type = type;
    const { data } = await api.get('/api/inventory/movements', { params });
    return { ...data, page, totalPages: Math.ceil(data.total / limit) };
  },

  getSuppliers: async (): Promise<SupplierOutput[]> => {
    const { data } = await api.get('/api/suppliers');
    return data.suppliers;
  },

  getWarehouses: async (): Promise<WarehouseOutput[]> => {
    const { data } = await api.get('/api/warehouses');
    return data.warehouses;
  },
};