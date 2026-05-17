import type { PasswordHasher } from '../ports/PasswordHasher.js';

export class User {
  constructor(
    public readonly id: number,
    public readonly username: string,
    public readonly passwordHash: string,
    public readonly isAdmin: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Check a plaintext password against the stored hash.
   * PasswordHasher is passed as a parameter to keep the domain
   * free of infrastructure dependencies.
   */
  async checkPassword(plain: string, hasher: PasswordHasher): Promise<boolean> {
    return hasher.compare(plain, this.passwordHash);
  }

  /** Return a safe representation that never exposes passwordHash. */
  toSafeOutput(): { id: number; username: string; isAdmin: boolean } {
    return {
      id: this.id,
      username: this.username,
      isAdmin: this.isAdmin,
    };
  }

  /** Reconstruct a User from a raw Prisma row. */
  static fromPrisma(raw: {
    id: number;
    username: string;
    passwordHash: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
  }): User {
    return new User(
      raw.id,
      raw.username,
      raw.passwordHash,
      raw.isAdmin,
      raw.createdAt,
      raw.updatedAt,
    );
  }
}