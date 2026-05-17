import type { ProductRepository } from '../../domain/ports/ProductRepository.js';
import { NotFoundError } from '../../domain/errors.js';

export class GetProduct {
  constructor(private readonly productRepo: ProductRepository) {}

  async execute(input: GetProduct.Input): Promise<GetProduct.Output> {
    const product = await this.productRepo.findById(input.id);
    if (!product) {
      throw new NotFoundError('Product', input.id);
    }
    return { product };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace GetProduct {
  export interface Input {
    id: number;
  }

  export interface Output {
    product: import('../../domain/entities/Product.js').Product;
  }
}