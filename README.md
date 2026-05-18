# Legacy Nexus — Refactor

Modernización fullstack de un ERP retail/logístico legacy.
- **Before**: Python/Flask monolith + JS vanilla + SQLite
- **After**: TypeScript + React + Express + Prisma ORM

## Quick Start

### Prerequisites
- **Node.js** >= 20.x (check with `node --version`)
- **pnpm** >= 9.x (install with `corepack enable` or `npm i -g pnpm`)

### Setup

1. Clone and install:
```bash
git clone <repo-url>
cd legacy-nexus-refactor
cp .env.example .env
pnpm install
```

2. **If using pnpm 11+**, approve build scripts when prompted (or run):
```bash
pnpm approve-builds
# Select: @prisma/engines, esbuild, prisma
```

3. Run the setup script (generates Prisma client, creates DB, seeds data):
```bash
pnpm project:setup
```

2. Start the development servers:
```bash
pnpm dev
```

This starts both the API (port 3000) and the web app (port 5173).

### Validate

Run the health check to verify everything compiles:
```bash
pnpm project:validate
```

### Project Structure
```
apps/
  api/        # Express.js backend (Hexagonal architecture)
  web/        # React + Vite frontend (TanStack Query, shadcn/ui)
packages/
  shared/     # Shared Zod schemas and types
```

### Seed Data
The database is seeded with real legacy data from `apps/api/prisma/seed_data.sql`:
- 5 users (admin + regular)
- 5 suppliers
- 3 warehouses
- 500 products
- 1500 inventory records (500 products × 3 warehouses)

Stack: Node, TypeScript, Express, React, Vite, Prisma ORM, SQLite, Vitest.