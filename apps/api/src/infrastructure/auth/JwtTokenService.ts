import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
import type { TokenService, TokenPayload } from '../../domain/ports/TokenService.js';

export class JwtTokenService implements TokenService {
  private readonly secret: string;
  private readonly accessExpiry: StringValue | number;
  private readonly refreshExpiry: StringValue | number;

  constructor() {
    const secret = process.env['JWT_SECRET'];
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    this.secret = secret;
    this.accessExpiry = (process.env['JWT_ACCESS_EXPIRY'] ?? '15m') as StringValue;
    this.refreshExpiry = (process.env['JWT_REFRESH_EXPIRY'] ?? '7d') as StringValue;
  }

  generate(payload: TokenPayload): { accessToken: string; refreshToken: string } {
    const accessToken = jwt.sign(
      { userId: payload.userId, username: payload.username, isAdmin: payload.isAdmin },
      this.secret,
      { algorithm: 'HS256', expiresIn: this.accessExpiry },
    );

    const refreshToken = jwt.sign(
      { userId: payload.userId, username: payload.username, isAdmin: payload.isAdmin },
      this.secret,
      { algorithm: 'HS256', expiresIn: this.refreshExpiry },
    );

    return { accessToken, refreshToken };
  }

  verify(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.secret, { algorithms: ['HS256'] }) as jwt.JwtPayload;
    return {
      userId: decoded['userId'] as number,
      username: decoded['username'] as string,
      isAdmin: decoded['isAdmin'] as boolean,
    };
  }
}