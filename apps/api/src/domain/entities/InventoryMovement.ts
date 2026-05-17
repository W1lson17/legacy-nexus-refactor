export type MovementType = 'IN' | 'OUT' | 'ADJUST' | 'SALE' | 'PURCHASE' | 'RETURN';

export class InventoryMovement {
  constructor(
    public readonly id: number,
    public readonly productId: number,
    public readonly warehouseId: number,
    public readonly qty: number,
    public readonly type: MovementType,
    public readonly refId: number | null,
    public readonly ts: Date,
  ) {}

  static fromPrisma(raw: {
    id: number;
    productId: number;
    warehouseId: number;
    qty: number;
    type: string;
    refId: number | null;
    ts: Date;
  }): InventoryMovement {
    return new InventoryMovement(
      raw.id,
      raw.productId,
      raw.warehouseId,
      raw.qty,
      raw.type as MovementType,
      raw.refId,
      raw.ts,
    );
  }
}