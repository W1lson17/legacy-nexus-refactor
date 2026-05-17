import type { ProductRepository } from '../../domain/ports/ProductRepository.js';
import { Product } from '../../domain/entities/Product.js';
import { ConflictError } from '../../domain/errors.js';

export class CreateProduct {
  constructor(private readonly productRepo: ProductRepository) {}

  async execute(input: CreateProduct.Input): Promise<CreateProduct.Output> {
    const existing = await this.productRepo.findBySku(input.sku);
    if (existing) {
      throw new ConflictError(`Product with SKU "${input.sku}" already exists`);
    }

    const now = new Date();
    const product = new Product(
      0, // id assigned by DB
      input.sku,
      input.name,
      input.description ?? null,
      input.price,
      input.category ?? null,
      input.supplierId ?? null,
      now,
      now,
      null,
    );

    const saved = await this.productRepo.save(product);
    return { product: saved };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CreateProduct {
  export interface Input {
    sku: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    supplierId?: number;
  }

  export interface Output {
    product: Product;
  }
}