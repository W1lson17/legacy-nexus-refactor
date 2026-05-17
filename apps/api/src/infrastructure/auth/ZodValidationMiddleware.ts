import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

/**
 * Factory that creates Express middleware to validate req.body against a Zod schema.
 * Returns 400 with error details on validation failure.
 */
export function zodValidationMiddleware(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: result.error.errors,
      });
      return;
    }
    req.body = result.data;
    next();
  };
}