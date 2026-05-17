import bcrypt from 'bcrypt';
import type { PasswordHasher } from '../../domain/ports/PasswordHasher.js';

export class BcryptPasswordAdapter implements PasswordHasher {
  private readonly cost: number;

  constructor(cost?: number) {
    this.cost = cost ?? parseInt(process.env['BCRYPT_COST'] ?? '12', 10);
  }

  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.cost);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}