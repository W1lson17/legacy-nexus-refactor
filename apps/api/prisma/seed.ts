import 'dotenv/config';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcrypt';

const adapter = new PrismaLibSql({
  url: process.env['DATABASE_URL']!,
});

const prisma = new PrismaClient({ adapter });

const BCRYPT_COST = 12;

// ── Parse legacy seed_data.sql ─────────────────────────────────────────────────

const __dirname = dirname(fileURLToPath(import.meta.url));
const LEGACY_SEED_PATH = join(__dirname, 'seed_data.sql');

interface LegacyUser {
  username: string;
  password: string;
  isAdmin: boolean;
}

interface LegacySupplier {
  name: string;
  contact: string | null;
  country: string | null;
}

interface LegacyWarehouse {
  name: string;
  region: string | null;
}

interface LegacyProduct {
  id: number;
  sku: string;
  name: string;
  price: number;
  category: string | null;
  supplierId: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

function parseLegacySeed(): {
  users: LegacyUser[];
  suppliers: LegacySupplier[];
  warehouses: LegacyWarehouse[];
  products: LegacyProduct[];
} {
  const sql = readFileSync(LEGACY_SEED_PATH, 'utf-8');

  // Parse users
  const users: LegacyUser[] = [];
  const userMatch = sql.match(/INSERT INTO users\s*\(username,\s*password,\s*is_admin\)\s*VALUES\s*(.+?);/s);
  if (userMatch) {
    const values = userMatch[1];
    const rows = values.match(/\(([^)]+)\)/g);
    if (rows) {
      for (const row of rows) {
        const parts = row.slice(1, -1).split(',').map(s => s.trim().replace(/^'|'$/g, ''));
        users.push({
          username: parts[0],
          password: parts[1],
          isAdmin: parts[2] === '1',
        });
      }
    }
  }

  // Parse warehouses
  const warehouses: LegacyWarehouse[] = [];
  const whMatch = sql.match(/INSERT INTO warehouses\s*\(name,\s*region\)\s*VALUES\s*(.+?);/s);
  if (whMatch) {
    const values = whMatch[1];
    const rows = values.match(/\(([^)]+)\)/g);
    if (rows) {
      for (const row of rows) {
        const inner = row.slice(1, -1);
        // Handle quoted strings with possible commas inside
        const parts = inner.match(/'([^']*)'/g)?.map(s => s.slice(1, -1)) || [];
        warehouses.push({
          name: parts[0] || null,
          region: parts[1] || null,
        });
      }
    }
  }

  // Parse suppliers
  const suppliers: LegacySupplier[] = [];
  const supMatch = sql.match(/INSERT INTO suppliers\s*\(name,\s*contact,\s*country\)\s*VALUES\s*(.+?);/s);
  if (supMatch) {
    const values = supMatch[1];
    const rows = values.match(/\(([^)]+)\)/g);
    if (rows) {
      for (const row of rows) {
        const inner = row.slice(1, -1);
        const parts = inner.match(/'([^']*)'/g)?.map(s => s.slice(1, -1)) || [];
        suppliers.push({
          name: parts[0] || null,
          contact: parts[1] || null,
          country: parts[2] || null,
        });
      }
    }
  }

  // Parse products — each product is a separate INSERT statement
  const products: LegacyProduct[] = [];
  const productRegex = /INSERT INTO products\s*\(id,\s*sku,\s*name,\s*price,\s*category,\s*supplier_id,\s*created_at,\s*updated_at,\s*deleted_at\)\s*VALUES\s*\((\d+),\s*'([^']*)',\s*'([^']*(?:''[^']*)*)',\s*([\d.]+),\s*'([^']*)',\s*(\d+|NULL),\s*'([^']*)',\s*'([^']*)',\s*(NULL|'[^']*')\)/g;
  let match: RegExpExecArray | null;
  while ((match = productRegex.exec(sql)) !== null) {
    const deletedAtRaw = match[9];
    products.push({
      id: parseInt(match[1], 10),
      sku: match[2],
      name: match[3].replace(/''/g, "'"),
      price: parseFloat(match[4]),
      category: match[5] || null,
      supplierId: match[6] === 'NULL' ? null : parseInt(match[6], 10),
      createdAt: match[7],
      updatedAt: match[8],
      deletedAt: deletedAtRaw === 'NULL' ? null : deletedAtRaw.slice(1, -1),
    });
  }

  return { users, suppliers, warehouses, products };
}

// ── Main ───────────────────────────────────────────────────────────────────────

async function main() {
  console.log('[seed] Parsing legacy seed_data.sql...');
  const data = parseLegacySeed();
  console.log(`[seed] Parsed: ${data.users.length} users, ${data.suppliers.length} suppliers, ${data.warehouses.length} warehouses, ${data.products.length} products`);

  // ── Users ────────────────────────────────────────────────────────────────────
  let userCreated = 0;
  let userSkipped = 0;

  for (const u of data.users) {
    const existing = await prisma.user.findUnique({
      where: { username: u.username },
    });

    if (existing) {
      if (existing.passwordHash.startsWith('$2b$')) {
        userSkipped++;
      } else {
        const hashed = await bcrypt.hash(u.password, BCRYPT_COST);
        await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash: hashed },
        });
        userCreated++;
      }
    } else {
      const hashed = await bcrypt.hash(u.password, BCRYPT_COST);
      await prisma.user.create({
        data: {
          username: u.username,
          passwordHash: hashed,
          isAdmin: u.isAdmin,
        },
      });
      userCreated++;
    }
  }

  console.log(`[seed] Users — ${userCreated} created/rehashed, ${userSkipped} skipped`);

  // ── Warehouses ───────────────────────────────────────────────────────────────
  let warehouseCreated = 0;
  for (const w of data.warehouses) {
    const existing = await prisma.warehouse.findFirst({ where: { name: w.name } });
    if (!existing) {
      await prisma.warehouse.create({ data: w });
      warehouseCreated++;
    }
  }
  console.log(`[seed] Warehouses — ${warehouseCreated} created`);

  // ── Suppliers ────────────────────────────────────────────────────────────────
  let supplierCreated = 0;
  for (const s of data.suppliers) {
    const existing = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.supplier.create({ data: s });
      supplierCreated++;
    }
  }
  console.log(`[seed] Suppliers — ${supplierCreated} created`);

  // ── Products (upsert by SKU) ─────────────────────────────────────────────────
  let productCreated = 0;
  let productSkipped = 0;

  for (const p of data.products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (existing) {
      productSkipped++;
      continue;
    }
    await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        description: null,
        price: p.price,
        category: p.category,
        supplierId: p.supplierId,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
        deletedAt: p.deletedAt ? new Date(p.deletedAt) : null,
      },
    });
    productCreated++;
  }
  console.log(`[seed] Products — ${productCreated} created, ${productSkipped} skipped (total: ${data.products.length})`);

  // ── Inventory Stock (product × warehouse, quantity=0) ─────────────────────────
  const allProducts = await prisma.product.findMany({ select: { id: true } });
  const allWarehouses = await prisma.warehouse.findMany({ select: { id: true } });

  let stockCreated = 0;
  for (const product of allProducts) {
    for (const warehouse of allWarehouses) {
      const existing = await prisma.inventoryStock.findUnique({
        where: {
          productId_warehouseId: {
            productId: product.id,
            warehouseId: warehouse.id,
          },
        },
      });
      if (!existing) {
        await prisma.inventoryStock.create({
          data: {
            productId: product.id,
            warehouseId: warehouse.id,
            quantity: 0,
          },
        });
        stockCreated++;
      }
    }
  }

  console.log(`[seed] Inventory Stock — ${stockCreated} rows created (${allProducts.length} products × ${allWarehouses.length} warehouses = ${allProducts.length * allWarehouses.length} combos)`);
  console.log('[seed] Done');
}

main()
  .catch((e) => {
    console.error('[seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
