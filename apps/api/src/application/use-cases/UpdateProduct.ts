import type { ProductRepository } from '../../domain/ports/ProductRepository.js';
import type { InventoryRepository } from '../../domain/ports/InventoryRepository.js';
import { Product } from '../../domain/entities/Product.js';
import { NotFoundError } from '../../domain/errors.js';

export class UpdateProduct {
  constructor(
    private readonly productRepo: ProductRepository,
    private readonly inventoryRepo: InventoryRepository,
  ) {}

  async execute(input: UpdateProduct.Input): Promise<UpdateProduct.Output> {
    const product = await this.productRepo.findById(input.id);
    if (!product) {
      throw new NotFoundError('Product', input.id);
    }

    // Build updated product — only override fields that are provided (partial update)
    const updatedPrice = input.price ?? product.price;
    const { product: priceUpdated, changed: priceChanged } = product.updatePrice(updatedPrice);

    let updated: Product;
    if (priceChanged) {
      updated = new Product(
        priceUpdated.id,
        input.sku ?? priceUpdated.sku,
        input.name ?? priceUpdated.name,
        input.description !== undefined ? input.description ?? null : priceUpdated.description,
        priceUpdated.price,
        input.category ?? priceUpdated.category,
        input.supplierId !== undefined ? input.supplierId ?? null : priceUpdated.supplierId,
        priceUpdated.createdAt,
        new Date(),
        priceUpdated.deletedAt,
      );
    } else {
      updated = new Product(
        product.id,
        input.sku ?? product.sku,
        input.name ?? product.name,
        input.description !== undefined ? input.description ?? null : product.description,
        product.price,
        input.category ?? product.category,
        input.supplierId !== undefined ? input.supplierId ?? null : product.supplierId,
        product.createdAt,
        new Date(),
        product.deletedAt,
      );
    }

    const saved = await this.productRepo.save(updated);

    // If price changed, log an ADJUST movement
    if (priceChanged) {
      await this.inventoryRepo.adjustStock({
        productId: saved.id,
        warehouseId: 1, // default warehouse for price audit
        qty: 0, // zero-qty adjustment — price change audit only
        type: 'ADJUST',
        refId: saved.id,
      });
    }

    return { product: saved };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace UpdateProduct {
  export interface Input {
    id: number;
    sku?: string;
    name?: string;
    description?: string;
    price?: number;
    category?: string;
    supplierId?: number;
  }

  export interface Output {
    product: Product;
  }
}