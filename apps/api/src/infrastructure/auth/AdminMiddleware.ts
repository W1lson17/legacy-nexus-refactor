import type { RequestHandler } from 'express';

/**
 * Middleware that checks req.user.isAdmin.
 * Must run AFTER authMiddleware — assumes req.user is populated.
 * Returns 403 if the user is not an admin.
 */
export function adminMiddleware(): RequestHandler {
  return (req, res, next) => {
    if (!req.user?.isAdmin) {
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }
    next();
  };
}