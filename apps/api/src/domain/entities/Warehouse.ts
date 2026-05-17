export class Warehouse {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly region: string | null,
  ) {}

  static fromPrisma(raw: { id: number; name: string; region: string | null }): Warehouse {
    return new Warehouse(raw.id, raw.name, raw.region);
  }
}