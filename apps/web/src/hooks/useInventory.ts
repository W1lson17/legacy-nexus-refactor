import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryApi, type InventoryItem, type PaginatedInventory, type PaginatedMovements } from '../api/inventory';
import type { InventoryAdjustInput } from '@legacy/shared';

// Query keys
export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => ['inventory', 'list'] as const,
  list: (page: number, limit: number, warehouseId?: number) =>
    [...inventoryKeys.lists(), { page, limit, warehouseId }] as const,
  warehouses: () => ['inventory', 'warehouses'] as const,
  suppliers: () => ['inventory', 'suppliers'] as const,
  movements: () => ['inventory', 'movements'] as const,
  movement: (filters: { productId?: number; warehouseId?: number; type?: string; page: number; limit: number }) =>
    [...inventoryKeys.movements(), filters] as const,
};

// Queries

export function useInventory(page: number, limit: number, warehouseId?: number) {
  return useQuery<PaginatedInventory>({
    queryKey: inventoryKeys.list(page, limit, warehouseId),
    queryFn: () => inventoryApi.list(page, limit, warehouseId),
  });
}

export function useWarehouses() {
  return useQuery({
    queryKey: inventoryKeys.warehouses(),
    queryFn: () => inventoryApi.getWarehouses(),
  });
}

export function useSuppliers() {
  return useQuery({
    queryKey: inventoryKeys.suppliers(),
    queryFn: () => inventoryApi.getSuppliers(),
  });
}

export function useMovements(
  productId?: number,
  warehouseId?: number,
  type?: string,
  page = 1,
  limit = 20,
) {
  return useQuery<PaginatedMovements>({
    queryKey: inventoryKeys.movement({ productId, warehouseId, type, page, limit }),
    queryFn: () => inventoryApi.getMovements(productId, warehouseId, type, page, limit),
  });
}

// Mutations

export function useAdjustStock() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: InventoryAdjustInput) => inventoryApi.adjust(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.all });
    },
  });
}