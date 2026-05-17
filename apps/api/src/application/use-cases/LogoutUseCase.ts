export class LogoutUseCase {
  execute(): LogoutUseCase.Output {
    return {
      success: true,
      clearCookies: {
        accessToken: {
          maxAge: 0,
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'lax' as const,
          path: '/',
        },
        refreshToken: {
          maxAge: 0,
          httpOnly: true,
          secure: process.env['NODE_ENV'] === 'production',
          sameSite: 'lax' as const,
          path: '/',
        },
      },
    };
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace LogoutUseCase {
  export interface Input {} // eslint-disable-line @typescript-eslint/no-empty-object-type

  export interface Output {
    success: true;
    clearCookies: {
      accessToken: CookieOptions;
      refreshToken: CookieOptions;
    };
  }

  export interface CookieOptions {
    maxAge: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'lax' | 'strict' | 'none';
    path: string;
  }
}