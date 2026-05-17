import { Router } from 'express';
import type { RequestHandler } from 'express';
import type { CreateProduct } from '../../application/use-cases/CreateProduct.js';
import type { UpdateProduct } from '../../application/use-cases/UpdateProduct.js';
import type { DeleteProduct } from '../../application/use-cases/DeleteProduct.js';
import type { GetProduct } from '../../application/use-cases/GetProduct.js';
import type { ListProducts } from '../../application/use-cases/ListProducts.js';
import type { SearchProducts } from '../../application/use-cases/SearchProducts.js';
import type { TokenService } from '../../domain/ports/TokenService.js';
import { authMiddleware } from '../auth/AuthMiddleware.js';
import { adminMiddleware } from '../auth/AdminMiddleware.js';
import { zodValidationMiddleware } from '../auth/ZodValidationMiddleware.js';
import { productCreateSchema, productUpdateSchema, productSearchSchema } from '@legacy/shared';
import { NotFoundError, ConflictError } from '../../domain/errors.js';

export function createProductRouter(deps: {
  createProductUseCase: CreateProduct;
  updateProductUseCase: UpdateProduct;
  deleteProductUseCase: DeleteProduct;
  getProductUseCase: GetProduct;
  listProductsUseCase: ListProducts;
  searchProductsUseCase: SearchProducts;
  tokenService: TokenService;
}): Router {
  const router = Router();

  // All product routes require authentication
  const auth = authMiddleware(deps.tokenService) as RequestHandler;
  const admin = adminMiddleware() as RequestHandler;

  // GET /api/products — List products (paginated)
  router.get('/', auth, async (req, res) => {
    try {
      const page = parseInt(String(req.query['page'] ?? ''), 10) || 1;
      const limit = parseInt(String(req.query['limit'] ?? ''), 10) || 20;
      const category = typeof req.query['category'] === 'string' ? req.query['category'] : undefined;

      const result = await deps.listProductsUseCase.execute({ page, limit, category });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/products/search — Search products
  router.get('/search', auth, async (req, res) => {
    try {
      const query = String(req.query['q'] ?? '');
      const page = parseInt(String(req.query['page'] ?? ''), 10) || 1;
      const limit = parseInt(String(req.query['limit'] ?? ''), 10) || 20;

      const result = await deps.searchProductsUseCase.execute({ query, page, limit });
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GET /api/products/:id — Get single product
  router.get('/:id', auth, async (req, res) => {
    try {
      const id = parseInt(String(req.params['id']), 10);
      const result = await deps.getProductUseCase.execute({ id });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // POST /api/products — Create product (admin only)
  router.post(
    '/',
    auth,
    admin,
    zodValidationMiddleware(productCreateSchema) as RequestHandler,
    async (req, res) => {
      try {
        const result = await deps.createProductUseCase.execute(req.body);
        res.status(201).json(result);
      } catch (error) {
        if (error instanceof ConflictError) {
          res.status(409).json({ error: error.message });
          return;
        }
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  // PUT /api/products/:id — Update product (admin only)
  router.put(
    '/:id',
    auth,
    admin,
    zodValidationMiddleware(productUpdateSchema) as RequestHandler,
    async (req, res) => {
      try {
        const id = parseInt(String(req.params['id']), 10);
        const result = await deps.updateProductUseCase.execute({ id, ...req.body });
        res.status(200).json(result);
      } catch (error) {
        if (error instanceof NotFoundError) {
          res.status(404).json({ error: error.message });
          return;
        }
        res.status(500).json({ error: 'Internal server error' });
      }
    },
  );

  // DELETE /api/products/:id — Soft-delete product (admin only)
  router.delete('/:id', auth, admin, async (req, res) => {
    try {
      const id = parseInt(String(req.params['id']), 10);
      const result = await deps.deleteProductUseCase.execute({ id });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof NotFoundError) {
        res.status(404).json({ error: error.message });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  return router;
}