import type { Product } from '../entities/Product.js';

export interface ProductFindAllParams {
  page: number;
  limit: number;
  category?: string;
}

export interface ProductSearchParams {
  query: string;
  page: number;
  limit: number;
}

export interface ProductRepository {
  findById(id: number): Promise<Product | null>;
  findBySku(sku: string): Promise<Product | null>;
  findAll(params: ProductFindAllParams): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }>;
  search(params: ProductSearchParams): Promise<{ products: Product[]; total: number }>;
  save(product: Product): Promise<Product>;
  softDelete(id: number): Promise<void>;
}