import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, type PaginatedProducts } from '../api/products';
import type { ProductCreateInput, ProductUpdateInput } from '@legacy/shared';

// Query keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => ['products', 'list'] as const,
  list: (page: number, limit: number, category?: string) =>
    [...productKeys.lists(), { page, limit, category }] as const,
  searches: () => ['products', 'search'] as const,
  search: (query: string, page: number, limit: number) =>
    [...productKeys.searches(), { query, page, limit }] as const,
  details: () => ['products', 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  categories: () => ['products', 'categories'] as const,
};

// Queries

export function useProducts(page: number, limit: number, category?: string) {
  return useQuery<PaginatedProducts>({
    queryKey: productKeys.list(page, limit, category || undefined),
    queryFn: () => productsApi.list(page, limit, category || undefined),
  });
}

export function useSearchProducts(query: string, page: number, limit: number) {
  return useQuery<PaginatedProducts>({
    queryKey: productKeys.search(query, page, limit),
    queryFn: () => productsApi.search(query, page, limit),
    enabled: query.trim().length > 0,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsApi.getById(id),
    enabled: id > 0,
  });
}

export function useCategories() {
  return useQuery<string[]>({
    queryKey: productKeys.categories(),
    queryFn: () => productsApi.getCategories(),
  });
}

// Mutations

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductCreateInput) => productsApi.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductUpdateInput }) =>
      productsApi.update(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}