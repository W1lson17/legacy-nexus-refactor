import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { GetInventory } from '../../application/use-cases/GetInventory.js';
import type { AdjustStock } from '../../application/use-cases/AdjustStock.js';
import type { GetInventoryMovements } from '../../application/use-cases/GetInventoryMovements.js';
import type { TokenService } from '../../domain/ports/TokenService.js';
import { authMiddleware } from '../auth/AuthMiddleware.js';
import { adminMiddleware } from '../auth/AdminMiddleware.js';
import { zodValidationMiddleware } from '../auth/ZodValidationMiddleware.js';
import { inventoryAdjustSchema } from '@legacy/shared';

export function createInventoryRouter(deps: {
  getInventoryUseCase: GetInventory;
  adjustStockUseCase: AdjustStock;
  getInventoryMovementsUseCase: GetInventoryMovements;
  tokenService: TokenService;
}): Router {
  const router = Router();

  const auth = authMiddleware(deps.tokenService) as RequestHandler;
  const admin = adminMiddleware() as RequestHandler;

  // GET /api/inventory — Get inventory (optional warehouseId filter, paginated)
  router.get('/', auth, async (req, res) => {
    try {
      const warehouseId = req.query['warehouseId']
        ? parseInt(String(req.query['warehouseId']), 10)
        : undefined;
      const page = parseInt(String(req.query['page'] ?? ''), 10) || 1;
      const limit = parseInt(String(req.query['limit'] ?? ''), 10) || 20;

      const result = await deps.getInventoryUseCase.execute({ warehouseId, page, limit });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/inventory/adjust — Adjust stock (admin only)
  router.post(
    '/adjust',
    auth,
    admin,
    zodValidationMiddleware(inventoryAdjustSchema) as RequestHandler,
    async (req, res) => {
      try {
        const result = await deps.adjustStockUseCase.execute(req.body);
        res.status(200).json(result);
      } catch (error) {
        if (error instanceof Error) {
          res.status(400).json({ error: error.message });
          return;
        }
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  // GET /api/inventory/movements — Get movement audit trail
  router.get('/movements', auth, async (req, res) => {
    try {
      const productId = req.query['productId']
        ? parseInt(String(req.query['productId']), 10)
        : undefined;
      const warehouseId = req.query['warehouseId']
        ? parseInt(String(req.query['warehouseId']), 10)
        : undefined;
      const type = typeof req.query['type'] === 'string' ? req.query['type'] : undefined;
      const page = parseInt(String(req.query['page'] ?? ''), 10) || 1;
      const limit = parseInt(String(req.query['limit'] ?? ''), 10) || 20;

      const result = await deps.getInventoryMovementsUseCase.execute({
        productId,
        warehouseId,
        type: type as 'IN' | 'OUT' | 'ADJUST' | 'SALE' | 'PURCHASE' | 'RETURN' | undefined,
        page,
        limit,
      });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}