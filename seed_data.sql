-- seed_data.sql — IMMUTABLE REFERENCE
-- DO NOT MODIFY. Use as parity verification source only.
-- This file represents the original legacy SQLite data migrated to PostgreSQL.

BEGIN;

-- ── Users ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name          VARCHAR(255) NOT NULL,
  role          VARCHAR(50) DEFAULT 'user',
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (email, password_hash, name, role) VALUES
  ('admin@nexus.com', '$2b$10$placeholder_hash_admin', 'Admin User', 'admin'),
  ('user@nexus.com',  '$2b$10$placeholder_hash_user',  'Regular User', 'user'),
  ('legacy_a@nexus.com', '$2b$10$placeholder_hash_legacy', 'LEGACY_A Customer', 'user');

-- ── Suppliers ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS suppliers (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  contact_info TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
);

INSERT INTO suppliers (name, contact_info) VALUES
  ('Acme Supplies', 'contact@acme.com'),
  ('Global Trade Co', 'sales@globaltrade.com'),
  ('Local Distributors', 'info@localdist.com');

-- ── Warehouses ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS warehouses (
  id        SERIAL PRIMARY KEY,
  name      VARCHAR(255) NOT NULL,
  location  VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO warehouses (name, location) VALUES
  ('Main Warehouse', 'Mexico City'),
  ('Secondary Warehouse', 'Guadalajara'),
  ('Distribution Center', 'Monterrey');

-- ── Products ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  sku         VARCHAR(100) UNIQUE NOT NULL,
  name        VARCHAR(255) NOT NULL,
  description TEXT,
  price       DECIMAL(12, 2) NOT NULL,
  cost        DECIMAL(12, 2),
  category    VARCHAR(100),
  is_legacy_a BOOLEAN DEFAULT FALSE,
  deleted_at  TIMESTAMP,
  created_at  TIMESTAMP DEFAULT NOW(),
  updated_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO products (sku, name, description, price, cost, category, is_legacy_a) VALUES
  ('SKU-001', 'Widget A', 'Standard widget',       100.00,  60.00, 'Widgets',    FALSE),
  ('SKU-002', 'Widget B', 'Premium widget',        200.00, 120.00, 'Widgets',    FALSE),
  ('SKU-003', 'Gadget X', 'Multi-purpose gadget',   150.00,  90.00, 'Gadgets',    FALSE),
  ('SKU-004', 'Gadget Y', 'Compact gadget',         75.00,  45.00, 'Gadgets',    FALSE),
  ('SKU-005', 'LEGACY-A Item', 'Discount-eligible', 100.00,  55.00, 'Special',    TRUE),
  ('SKU-006', 'Tool Z', 'Heavy-duty tool',         300.00, 180.00, 'Tools',      FALSE),
  ('SKU-007', 'Tool W', 'Lightweight tool',          50.00,  25.00, 'Tools',      FALSE),
  ('SKU-008', 'Accessory M', 'Universal mount',     25.00,  12.00, 'Accessories', FALSE);

-- ── Inventory Stock ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_stock (
  id            SERIAL PRIMARY KEY,
  product_id    INT NOT NULL REFERENCES products(id),
  warehouse_id  INT NOT NULL REFERENCES warehouses(id),
  quantity       INT DEFAULT 0,
  created_at    TIMESTAMP DEFAULT NOW(),
  updated_at    TIMESTAMP DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);

INSERT INTO inventory_stock (product_id, warehouse_id, quantity) VALUES
  (1, 1, 100), (1, 2, 50),
  (2, 1, 75),  (2, 3, 30),
  (3, 1, 200), (3, 2, 80),
  (4, 2, 150), (4, 3, 60),
  (5, 1, 40),  (5, 3, 20),
  (6, 1, 25),  (6, 2, 15),
  (7, 1, 300), (7, 3, 100),
  (8, 2, 500), (8, 3, 200);

-- ── Inventory Movements ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_movements (
  id              SERIAL PRIMARY KEY,
  product_id      INT NOT NULL REFERENCES products(id),
  warehouse_id    INT NOT NULL REFERENCES warehouses(id),
  quantity         INT NOT NULL,
  movement_type   VARCHAR(50) NOT NULL,
  reference_type  VARCHAR(50),
  reference_id    INT,
  created_at      TIMESTAMP DEFAULT NOW()
);

-- ── Sales ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id),
  subtotal   DECIMAL(12, 2) NOT NULL,
  discount   DECIMAL(12, 2) DEFAULT 0,
  iva        DECIMAL(12, 2) DEFAULT 0,
  total      DECIMAL(12, 2) NOT NULL,
  status     VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ── Sale Items ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sale_items (
  id         SERIAL PRIMARY KEY,
  sale_id    INT NOT NULL REFERENCES sales(id),
  product_id INT NOT NULL REFERENCES products(id),
  quantity    INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal   DECIMAL(12, 2) NOT NULL,
  discount   DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── Purchases ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchases (
  id         SERIAL PRIMARY KEY,
  supplier_id INT NOT NULL REFERENCES suppliers(id),
  total      DECIMAL(12, 2) NOT NULL,
  status     VARCHAR(50) DEFAULT 'pending',
  bank_ref   VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ── Purchase Items ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS purchase_items (
  id          SERIAL PRIMARY KEY,
  purchase_id INT NOT NULL REFERENCES purchases(id),
  product_id  INT NOT NULL REFERENCES products(id),
  quantity     INT NOT NULL,
  unit_price  DECIMAL(12, 2) NOT NULL,
  subtotal    DECIMAL(12, 2) NOT NULL,
  created_at  TIMESTAMP DEFAULT NOW()
);

-- ── Notifications ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id         SERIAL PRIMARY KEY,
  user_id    INT NOT NULL REFERENCES users(id),
  kind       VARCHAR(50) NOT NULL,
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  read       BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ── Refunds ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refunds (
  id         SERIAL PRIMARY KEY,
  sale_id    INT NOT NULL REFERENCES sales(id),
  user_id    INT NOT NULL REFERENCES users(id),
  reason     TEXT NOT NULL,
  amount     DECIMAL(12, 2) NOT NULL,
  status     VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ── Audit Log ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          SERIAL PRIMARY KEY,
  user_id     INT REFERENCES users(id),
  action      VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100) NOT NULL,
  entity_id   INT NOT NULL,
  details     TEXT,
  created_at  TIMESTAMP DEFAULT NOW()
);

COMMIT;