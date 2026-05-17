import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { ListWarehouses } from '../../application/use-cases/ListWarehouses.js';
import type { TokenService } from '../../domain/ports/TokenService.js';
import { authMiddleware } from '../auth/AuthMiddleware.js';

export function createWarehouseRouter(deps: {
  listWarehousesUseCase: ListWarehouses;
  tokenService: TokenService;
}): Router {
  const router = Router();

  const auth = authMiddleware(deps.tokenService) as RequestHandler;

  // GET /api/warehouses
  router.get('/', auth, async (_req, res) => {
    try {
      const result = await deps.listWarehousesUseCase.execute();
      res.status(200).json(result);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}