/* eslint-disable @typescript-eslint/no-namespace */
import type { RequestHandler } from 'express';
import type { TokenService, TokenPayload } from '../../domain/ports/TokenService.js';

// Extend Express Request type via declaration merging
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

/**
 * Middleware that extracts the access_token cookie, verifies it via
 * TokenService, and attaches the decoded payload to req.user.
 * Returns 401 on missing or invalid token.
 */
export function authMiddleware(tokenService: TokenService): RequestHandler {
  return (req, res, next) => {
    const token = req.cookies?.['access_token'];

    if (!token) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    try {
      const payload = tokenService.verify(token);
      req.user = payload;
      next();
    } catch {
      res.status(401).json({ error: 'Invalid or expired token' });
    }
  };
}