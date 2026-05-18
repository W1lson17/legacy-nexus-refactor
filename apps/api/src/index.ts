import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import express, { type Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

// Prisma
import { PrismaClient } from './generated/prisma/client.js';
import { PrismaLibSql } from '@prisma/adapter-libsql';

// Infrastructure adapters
import { PrismaUserRepository } from './infrastructure/auth/PrismaUserRepository.js';
import { JwtTokenService } from './infrastructure/auth/JwtTokenService.js';
import { BcryptPasswordAdapter } from './infrastructure/auth/BcryptPasswordAdapter.js';
import { createAuthRouter, createUsersRouter } from './infrastructure/auth/AuthController.js';
import { PrismaProductRepository } from './infrastructure/catalog/PrismaProductRepository.js';
import { PrismaInventoryRepository } from './infrastructure/catalog/PrismaInventoryRepository.js';
import { PrismaSupplierRepository } from './infrastructure/catalog/PrismaSupplierRepository.js';
import { PrismaWarehouseRepository } from './infrastructure/catalog/PrismaWarehouseRepository.js';
import { createProductRouter } from './infrastructure/catalog/ProductController.js';
import { createInventoryRouter } from './infrastructure/catalog/InventoryController.js';
import { createSupplierRouter } from './infrastructure/catalog/SupplierController.js';
import { createWarehouseRouter } from './infrastructure/catalog/WarehouseController.js';

// Use cases
import { LoginUseCase } from './application/use-cases/LoginUseCase.js';
import { LogoutUseCase } from './application/use-cases/LogoutUseCase.js';
import { GetCurrentUserUseCase } from './application/use-cases/GetCurrentUserUseCase.js';
import { ListUsersUseCase } from './application/use-cases/ListUsersUseCase.js';
import { CreateProduct } from './application/use-cases/CreateProduct.js';
import { UpdateProduct } from './application/use-cases/UpdateProduct.js';
import { DeleteProduct } from './application/use-cases/DeleteProduct.js';
import { GetProduct } from './application/use-cases/GetProduct.js';
import { ListProducts } from './application/use-cases/ListProducts.js';
import { SearchProducts } from './application/use-cases/SearchProducts.js';
import { GetInventory } from './application/use-cases/GetInventory.js';
import { AdjustStock } from './application/use-cases/AdjustStock.js';
import { GetInventoryMovements } from './application/use-cases/GetInventoryMovements.js';
import { ListSuppliers } from './application/use-cases/ListSuppliers.js';
import { ListWarehouses } from './application/use-cases/ListWarehouses.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirname, '../../../.env') });

const app: Express = express();
const PORT = process.env['PORT'] ?? 3000;

// ── Composition Root ──────────────────────────────────────────────────────────

const prisma = new PrismaClient({
  adapter: new PrismaLibSql({ url: process.env['DATABASE_URL']! }),
});

// Infrastructure adapters
const userRepo = new PrismaUserRepository(prisma);
const tokenService = new JwtTokenService();
const passwordHasher = new BcryptPasswordAdapter();

const productRepo = new PrismaProductRepository(prisma);
const inventoryRepo = new PrismaInventoryRepository(prisma);
const supplierRepo = new PrismaSupplierRepository(prisma);
const warehouseRepo = new PrismaWarehouseRepository(prisma);

// Use cases — each receives ONLY the ports it needs
const loginUseCase = new LoginUseCase(userRepo, tokenService, passwordHasher);
const logoutUseCase = new LogoutUseCase();
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepo);
const listUsersUseCase = new ListUsersUseCase(userRepo);

const createProductUseCase = new CreateProduct(productRepo);
const updateProductUseCase = new UpdateProduct(productRepo, inventoryRepo);
const deleteProductUseCase = new DeleteProduct(productRepo);
const getProductUseCase = new GetProduct(productRepo);
const listProductsUseCase = new ListProducts(productRepo);
const searchProductsUseCase = new SearchProducts(productRepo);
const getInventoryUseCase = new GetInventory(inventoryRepo);
const adjustStockUseCase = new AdjustStock(inventoryRepo);
const getInventoryMovementsUseCase = new GetInventoryMovements(inventoryRepo);
const listSuppliersUseCase = new ListSuppliers(supplierRepo);
const listWarehousesUseCase = new ListWarehouses(warehouseRepo);

// ── Global Middleware ──────────────────────────────────────────────────────────

app.use(
  cors({
    origin: process.env['CORS_ORIGIN'] || 'http://localhost:5173',
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// ── Rate Limiter ──────────────────────────────────────────────────────────────

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', loginLimiter);

// ── Routes ────────────────────────────────────────────────────────────────────

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '0.0.1' });
});

// Auth routes — POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me
const authRouter = createAuthRouter({
  loginUseCase,
  logoutUseCase,
  getCurrentUserUseCase,
  tokenService,
});
app.use('/api/auth', authRouter);

// Users route — GET /api/users (auth + admin required)
const usersRouter = createUsersRouter({
  listUsersUseCase,
  tokenService,
});
app.use('/api/users', usersRouter);

// Product routes — full CRUD + search
const productRouter = createProductRouter({
  createProductUseCase,
  updateProductUseCase,
  deleteProductUseCase,
  getProductUseCase,
  listProductsUseCase,
  searchProductsUseCase,
  tokenService,
});
app.use('/api/products', productRouter);

// Inventory routes — stock + movements
const inventoryRouter = createInventoryRouter({
  getInventoryUseCase,
  adjustStockUseCase,
  getInventoryMovementsUseCase,
  tokenService,
});
app.use('/api/inventory', inventoryRouter);

// Supplier routes — read-only list
const supplierRouter = createSupplierRouter({
  listSuppliersUseCase,
  tokenService,
});
app.use('/api/suppliers', supplierRouter);

// Warehouse routes — read-only list
const warehouseRouter = createWarehouseRouter({
  listWarehousesUseCase,
  tokenService,
});
app.use('/api/warehouses', warehouseRouter);

app.listen(PORT, () => {
  console.log(`[api] Server running on port ${PORT}`);
});

export default app;