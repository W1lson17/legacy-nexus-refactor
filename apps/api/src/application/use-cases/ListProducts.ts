import type { ProductRepository } from '../../domain/ports/ProductRepository.js';

export class ListProducts {
  constructor(private readonly productRepo: ProductRepository) {}

  async execute(input: ListProducts.Input): Promise<ListProducts.Output> {
    return this.productRepo.findAll({
      page: input.page,
      limit: input.limit,
      category: input.category,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ListProducts {
  export interface Input {
    page: number;
    limit: number;
    category?: string;
  }

  export interface Output {
    products: import('../../domain/entities/Product.js').Product[];
    total: number;
    page: number;
    totalPages: number;
  }
}