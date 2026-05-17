import type { ProductRepository } from '../../domain/ports/ProductRepository.js';
import { NotFoundError } from '../../domain/errors.js';

export class DeleteProduct {
  constructor(private readonly productRepo: ProductRepository) {}

  async execute(input: DeleteProduct.Input): Promise<DeleteProduct.Output> {
    const product = await this.productRepo.findById(input.id);
    if (!product) {
      throw new NotFoundError('Product', input.id);
    }

    await this.productRepo.softDelete(input.id);
    return { success: true };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace DeleteProduct {
  export interface Input {
    id: number;
  }

  export interface Output {
    success: boolean;
  }
}