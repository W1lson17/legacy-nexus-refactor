import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { ListSuppliers } from '../../application/use-cases/ListSuppliers.js';
import type { TokenService } from '../../domain/ports/TokenService.js';
import { authMiddleware } from '../auth/AuthMiddleware.js';

export function createSupplierRouter(deps: {
  listSuppliersUseCase: ListSuppliers;
  tokenService: TokenService;
}): Router {
  const router = Router();

  const auth = authMiddleware(deps.tokenService) as RequestHandler;

  // GET /api/suppliers
  router.get('/', auth, async (_req, res) => {
    try {
      const result = await deps.listSuppliersUseCase.execute();
      res.status(200).json(result);
    } catch {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}