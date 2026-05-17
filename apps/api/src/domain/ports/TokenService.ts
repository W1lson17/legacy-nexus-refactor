export interface TokenPayload {
  userId: number;
  username: string;
  isAdmin: boolean;
}

export interface TokenService {
  generate(payload: TokenPayload): { accessToken: string; refreshToken: string };
  verify(token: string): TokenPayload;
}