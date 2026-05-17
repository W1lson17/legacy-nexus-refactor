export class Product {
  constructor(
    public readonly id: number,
    public readonly sku: string,
    public readonly name: string,
    public readonly description: string | null,
    public readonly price: number,
    public readonly category: string | null,
    public readonly supplierId: number | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null,
  ) {}

  static fromPrisma(raw: {
    id: number;
    sku: string;
    name: string;
    description: string | null;
    price: { toString(): string } | number;
    category: string | null;
    supplierId: number | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }): Product {
    return new Product(
      raw.id,
      raw.sku,
      raw.name,
      raw.description,
      typeof raw.price === 'number' ? raw.price : parseFloat(raw.price.toString()),
      raw.category,
      raw.supplierId,
      raw.createdAt,
      raw.updatedAt,
      raw.deletedAt,
    );
  }

  isActive(): boolean {
    return this.deletedAt === null;
  }

  markDeleted(): Product {
    return new Product(
      this.id,
      this.sku,
      this.name,
      this.description,
      this.price,
      this.category,
      this.supplierId,
      this.createdAt,
      this.updatedAt,
      new Date(),
    );
  }

  updatePrice(newPrice: number): { product: Product; changed: boolean } {
    if (newPrice === this.price) return { product: this, changed: false };
    const updated = new Product(
      this.id,
      this.sku,
      this.name,
      this.description,
      newPrice,
      this.category,
      this.supplierId,
      this.createdAt,
      new Date(),
      this.deletedAt,
    );
    return { product: updated, changed: true };
  }
}