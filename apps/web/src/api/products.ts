import { api } from '../lib/axios';
import type { ProductCreateInput, ProductUpdateInput, ProductOutput } from '@legacy/shared';

export interface PaginatedProducts {
  products: ProductOutput[];
  total: number;
  page: number;
  totalPages: number;
}

export const productsApi = {
  list: async (page = 1, limit = 20, category?: string): Promise<PaginatedProducts> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (category) params.set('category', category);
    const { data } = await api.get(`/api/products?${params}`);
    return data;
  },

  search: async (query: string, page = 1, limit = 20): Promise<PaginatedProducts> => {
    const { data } = await api.get('/api/products/search', {
      params: { q: query, page, limit },
    });
    return data;
  },

  getById: async (id: number): Promise<ProductOutput> => {
    const { data } = await api.get(`/api/products/${id}`);
    return data;
  },

  create: async (input: ProductCreateInput): Promise<ProductOutput> => {
    const { data } = await api.post('/api/products', input);
    return data.product;
  },

  update: async (id: number, input: ProductUpdateInput): Promise<ProductOutput> => {
    const { data } = await api.put(`/api/products/${id}`, input);
    return data.product;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },

  getCategories: async (): Promise<string[]> => {
    const { data } = await api.get('/api/products', { params: { page: 1, limit: 1000 } });
    const categories = new Set<string>();
    for (const p of data.products as ProductOutput[]) {
      if (p.category) categories.add(p.category);
    }
    return Array.from(categories).sort();
  },
};