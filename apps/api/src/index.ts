import express, { type Express } from 'express';
import dotenv from 'dotenv';
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

// Use cases
import { LoginUseCase } from './application/use-cases/LoginUseCase.js';
import { LogoutUseCase } from './application/use-cases/LogoutUseCase.js';
import { GetCurrentUserUseCase } from './application/use-cases/GetCurrentUserUseCase.js';
import { ListUsersUseCase } from './application/use-cases/ListUsersUseCase.js';

dotenv.config();

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

// Use cases — each receives ONLY the ports it needs
const loginUseCase = new LoginUseCase(userRepo, tokenService, passwordHasher);
const logoutUseCase = new LogoutUseCase();
const getCurrentUserUseCase = new GetCurrentUserUseCase(userRepo);
const listUsersUseCase = new ListUsersUseCase(userRepo);

// ── Global Middleware ──────────────────────────────────────────────────────────

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

app.listen(PORT, () => {
  console.log(`[api] Server running on port ${PORT}`);
});

export default app;