import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { LoginUseCase } from '../../application/use-cases/LoginUseCase.js';
import type { LogoutUseCase } from '../../application/use-cases/LogoutUseCase.js';
import type { GetCurrentUserUseCase } from '../../application/use-cases/GetCurrentUserUseCase.js';
import type { ListUsersUseCase } from '../../application/use-cases/ListUsersUseCase.js';
import type { TokenService } from '../../domain/ports/TokenService.js';
import { zodValidationMiddleware } from './ZodValidationMiddleware.js';
import { authMiddleware } from './AuthMiddleware.js';
import { adminMiddleware } from './AdminMiddleware.js';
import { loginSchema } from '@legacy/shared';
import { InvalidCredentialsError } from '../../domain/errors.js';

const isProduction = process.env['NODE_ENV'] === 'production';

const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes in ms
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: isProduction,
  path: '/',
};

export function createAuthRouter(deps: {
  loginUseCase: LoginUseCase;
  logoutUseCase: LogoutUseCase;
  getCurrentUserUseCase: GetCurrentUserUseCase;
  tokenService: TokenService;
}): Router {
  const router = Router();

  // POST /api/auth/login
  router.post(
    '/login',
    zodValidationMiddleware(loginSchema) as RequestHandler,
    async (req, res) => {
      try {
        const result = await deps.loginUseCase.execute({
          username: req.body.username,
          password: req.body.password,
        });

        res
          .cookie('access_token', result.accessToken, {
            ...cookieOptions,
            maxAge: ACCESS_TOKEN_MAX_AGE,
          })
          .cookie('refresh_token', result.refreshToken, {
            ...cookieOptions,
            maxAge: REFRESH_TOKEN_MAX_AGE,
          })
          .status(200)
          .json({ user: result.user });
      } catch (error) {
        if (error instanceof InvalidCredentialsError) {
          res.status(401).json({ error: error.message });
          return;
        }
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  // POST /api/auth/logout
  router.post('/logout', (_req, res) => {
    const result = deps.logoutUseCase.execute();

    res
      .cookie('access_token', '', {
        ...result.clearCookies.accessToken,
      })
      .cookie('refresh_token', '', {
        ...result.clearCookies.refreshToken,
      })
      .status(200)
      .json({ success: true });
  });

  // GET /api/auth/me
  router.get(
    '/me',
    authMiddleware(deps.tokenService) as RequestHandler,
    async (req, res) => {
      try {
        const result = await deps.getCurrentUserUseCase.execute({
          userId: req.user!.userId,
        });
        res.status(200).json(result);
      } catch (error) {
        if (error instanceof Error) {
          res.status(401).json({ error: error.message });
          return;
        }
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  return router;
}

export function createUsersRouter(deps: {
  listUsersUseCase: ListUsersUseCase;
  tokenService: TokenService;
}): Router {
  const router = Router();

  // GET /api/users
  router.get(
    '/',
    authMiddleware(deps.tokenService) as RequestHandler,
    adminMiddleware() as RequestHandler,
    async (_req, res) => {
      try {
        const result = await deps.listUsersUseCase.execute();
        res.status(200).json(result);
      } catch {
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  return router;
}