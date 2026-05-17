import { DomainError } from '../errors.js';

export class InventoryStock {
  constructor(
    public readonly productId: number,
    public readonly warehouseId: number,
    public readonly quantity: number,
  ) {}

  static fromPrisma(raw: { productId: number; warehouseId: number; quantity: number }): InventoryStock {
    return new InventoryStock(raw.productId, raw.warehouseId, raw.quantity);
  }

  adjust(qty: number): InventoryStock {
    const newQty = this.quantity + qty;
    if (newQty < 0) {
      throw new DomainError(`Insufficient stock: cannot reduce by ${qty} (current: ${this.quantity})`);
    }
    return new InventoryStock(this.productId, this.warehouseId, newQty);
  }
}