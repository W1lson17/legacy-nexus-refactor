import type { ProductRepository } from '../../domain/ports/ProductRepository.js';

export class SearchProducts {
  constructor(private readonly productRepo: ProductRepository) {}

  async execute(input: SearchProducts.Input): Promise<SearchProducts.Output> {
    return this.productRepo.search({
      query: input.query,
      page: input.page,
      limit: input.limit,
    });
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace SearchProducts {
  export interface Input {
    query: string;
    page: number;
    limit: number;
  }

  export interface Output {
    products: import('../../domain/entities/Product.js').Product[];
    total: number;
  }
}