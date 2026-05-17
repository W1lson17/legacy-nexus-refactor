export class Supplier {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly contact: string | null,
    public readonly country: string | null,
  ) {}

  static fromPrisma(raw: { id: number; name: string; contact: string | null; country: string | null }): Supplier {
    return new Supplier(raw.id, raw.name, raw.contact, raw.country);
  }
}