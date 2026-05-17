import 'dotenv/config';
import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcrypt';

const adapter = new PrismaLibSql({
  url: process.env['DATABASE_URL']!,
});

const prisma = new PrismaClient({ adapter });

const BCRYPT_COST = 12;

interface SeedUser {
  username: string;
  password: string;
  isAdmin: boolean;
}

const DEFAULT_USERS: SeedUser[] = [
  { username: 'admin', password: '1234', isAdmin: true },
  { username: 'user', password: '1234', isAdmin: false },
];

// ── Suppliers ──────────────────────────────────────────────────────────────────

const DEFAULT_SUPPLIERS = [
  { name: 'Acme Industrial', contact: 'sales@acme.com', country: 'US' },
  { name: 'Global Parts Co.', contact: 'orders@globalparts.com', country: 'DE' },
  { name: 'Pacific Supply Ltd.', contact: 'info@pacificsupply.jp', country: 'JP' },
  { name: 'EuroTech Components', contact: 'b2b@eurotech.eu', country: 'FR' },
  { name: 'Southern Distributors', contact: 'sales@southerndist.com', country: 'BR' },
];

// ── Warehouses ─────────────────────────────────────────────────────────────────

const DEFAULT_WAREHOUSES = [
  { name: 'Warehouse North', region: 'US-East' },
  { name: 'Warehouse Central', region: 'US-Central' },
  { name: 'Warehouse West', region: 'US-West' },
];

// ── Products (231 products: mix of categories) ────────────────────────────────

const CATEGORIES = [
  'Electronics', 'Mechanical', 'Fasteners', 'Raw Materials', 'Safety',
  'Plumbing', 'Electrical', 'HVAC', 'Tools', 'Adhesives',
];

function generateProducts(): Array<{
  sku: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  supplierId: number;
}> {
  const products: Array<{
    sku: string;
    name: string;
    description: string | null;
    price: number;
    category: string;
    supplierId: number;
  }> = [];

  // Electronics (30 products)
  const electronics = [
    'Resistor 220Ω', 'Resistor 1kΩ', 'Resistor 10kΩ', 'Capacitor 100nF',
    'Capacitor 10µF', 'Capacitor 100µF', 'LED Red 5mm', 'LED Green 5mm',
    'LED Blue 5mm', 'Op-Amp LM741', 'Op-Amp LM358', 'Voltage Regulator 7805',
    'Voltage Regulator 7812', 'Arduino Nano', 'Raspberry Pi Pico',
    'Servo Motor SG90', 'Stepper Motor NEMA 17', 'DC Motor 12V',
    'Relay 5V SPDT', 'Relay 12V DPDT', 'PCB Board 5x7cm', 'Breadboard 830pt',
    'Jumper Wire Kit', 'USB Cable Type-A', 'HDMI Cable 1m', 'CAT6 Cable 2m',
    'Power Supply 5V 2A', 'Power Supply 12V 5A', 'LCD Display 16x2',
    'OLED Display 0.96"',
  ];
  for (let i = 0; i < electronics.length; i++) {
    products.push({
      sku: `ELEC-${String(i + 1).padStart(3, '0')}`,
      name: electronics[i],
      description: null,
      price: Math.round((2.5 + i * 1.3) * 100) / 100,
      category: 'Electronics',
      supplierId: (i % 5) + 1,
    });
  }

  // Mechanical (25 products)
  const mechanical = [
    'Ball Bearing 6201', 'Ball Bearing 6205', 'Ball Bearing 6210',
    'Linear Bearing LM8UU', 'Linear Bearing LM12UU', 'Timing Belt GT2 6mm',
    'Timing Pulley GT2 20T', 'Timing Pulley GT2 36T', 'Chain #40 10ft',
    'Sprocket #40 14T', 'Sprocket #40 18T', 'Coupling Flexible 6mm',
    'Coupling Rigid 8mm', 'Shaft 8mm x 300mm', 'Shaft 10mm x 500mm',
    'Gear Spur M1 20T', 'Gear Spur M1 40T', 'Gear Worm M2 Single',
    'Spring Compression 10mm', 'Spring Extension 20mm', 'Hinge Heavy Duty 4"',
    'Pneumatic Cylinder 50mm', 'Hydraulic Pump 3GPM', 'Gearbox NEMA 23 10:1',
    'Drive Belt A-68',
  ];
  for (let i = 0; i < mechanical.length; i++) {
    products.push({
      sku: `MECH-${String(i + 1).padStart(3, '0')}`,
      name: mechanical[i],
      description: null,
      price: Math.round((5.0 + i * 2.7) * 100) / 100,
      category: 'Mechanical',
      supplierId: (i % 5) + 1,
    });
  }

  // Fasteners (30 products)
  const fasteners = [
    'Hex Bolt M6x20', 'Hex Bolt M6x30', 'Hex Bolt M8x25', 'Hex Bolt M8x40',
    'Hex Bolt M10x30', 'Hex Bolt M10x50', 'Hex Nut M6', 'Hex Nut M8',
    'Hex Nut M10', 'Lock Nut M6', 'Lock Nut M8', 'Socket Head Cap M5x16',
    'Socket Head Cap M5x25', 'Socket Head Cap M6x20', 'Socket Head Cap M6x30',
    'Flat Washer M6', 'Flat Washer M8', 'Flat Washer M10', 'Spring Washer M6',
    'Spring Washer M8', 'Set Screw M4x6', 'Set Screw M5x8',
    'Wood Screw #8x1.5', 'Wood Screw #10x2', 'Sheet Metal Screw #8x3/4',
    'Self-Tapping Screw M5x16', 'Anchor Bolt M12x100', 'Carriage Bolt M8x40',
    'Eye Bolt M10', 'U-Bolt M8',
  ];
  for (let i = 0; i < fasteners.length; i++) {
    products.push({
      sku: `FAST-${String(i + 1).padStart(3, '0')}`,
      name: fasteners[i],
      description: null,
      price: Math.round((0.15 + i * 0.12) * 100) / 100,
      category: 'Fasteners',
      supplierId: (i % 5) + 1,
    });
  }

  // Raw Materials (25 products)
  const rawMaterials = [
    'Aluminum Sheet 1mm', 'Aluminum Sheet 2mm', 'Aluminum Rod 10mm',
    'Steel Plate 3mm', 'Steel Bar 12mm', 'Stainless Sheet 1.5mm',
    'Copper Sheet 0.5mm', 'Brass Rod 8mm', 'Carbon Fiber Sheet 2mm',
    'Acrylic Sheet 3mm', 'Polycarbonate Sheet 2mm', 'PVC Sheet 4mm',
    'Nylon Rod 12mm', 'Delrin Rod 10mm', 'Teflon Sheet 1mm',
    'Foam Board 5mm', 'MDF Board 6mm', 'Plywood Sheet 3mm',
    'Cork Sheet 2mm', 'Rubber Sheet 3mm', 'Silicone Sheet 1mm',
    'Gasket Material 2mm', 'Fiberglass Sheet 1.5mm', 'Welding Rod 2.4mm',
    'Solder Wire 0.8mm',
  ];
  for (let i = 0; i < rawMaterials.length; i++) {
    products.push({
      sku: `RAWM-${String(i + 1).padStart(3, '0')}`,
      name: rawMaterials[i],
      description: null,
      price: Math.round((3.0 + i * 1.8) * 100) / 100,
      category: 'Raw Materials',
      supplierId: (i % 5) + 1,
    });
  }

  // Safety (20 products)
  const safety = [
    'Safety Glasses Clear', 'Safety Glasses Tinted', 'Hard Hat White',
    'Hard Hat Yellow', 'Safety Vest Orange', 'Safety Vest Green',
    'Ear Plugs Foam', 'Ear Muffs NRR 25', 'Respirator N95',
    'Respirator P100', 'Gloves Nitrile L', 'Gloves Nitrile XL',
    'Gloves Leather M', 'Gloves Cut-Resistant L', 'Steel Toe Boots 10',
    'Steel Toe Boots 11', 'Fire Extinguisher 5lb', 'First Aid Kit 25pk',
    'Caution Tape 3"', 'Safety Sign "Wet Floor"',
  ];
  for (let i = 0; i < safety.length; i++) {
    products.push({
      sku: `SAFE-${String(i + 1).padStart(3, '0')}`,
      name: safety[i],
      description: null,
      price: Math.round((4.0 + i * 2.1) * 100) / 100,
      category: 'Safety',
      supplierId: (i % 5) + 1,
    });
  }

  // Plumbing (20 products)
  const plumbing = [
    'PVC Pipe 1/2" x 10ft', 'PVC Pipe 3/4" x 10ft', 'PVC Pipe 1" x 10ft',
    'PVC Elbow 1/2"', 'PVC Elbow 3/4"', 'PVC Tee 1/2"', 'PVC Tee 3/4"',
    'PVC Coupling 1/2"', 'PVC Coupling 3/4"', 'PVC Valve 1/2"',
    'Copper Pipe 1/2" x 10ft', 'Copper Pipe 3/4" x 10ft', 'Copper Elbow 1/2"',
    'Copper Tee 1/2"', 'Pipe Wrench 14"', 'Plumber Tape 1/2"',
    'Pipe Sealant', 'Drain Snake 25ft', 'Faucet Washer Kit',
    'Hose Clamp 1/2"-1"',
  ];
  for (let i = 0; i < plumbing.length; i++) {
    products.push({
      sku: `PLMB-${String(i + 1).padStart(3, '0')}`,
      name: plumbing[i],
      description: null,
      price: Math.round((1.5 + i * 0.9) * 100) / 100,
      category: 'Plumbing',
      supplierId: (i % 5) + 1,
    });
  }

  // Electrical (25 products)
  const electrical = [
    'Wire 14AWG Black 100ft', 'Wire 14AWG Red 100ft', 'Wire 12AWG Black 100ft',
    'Wire 12AWG White 100ft', 'Cable THHN 14AWG 500ft', 'Cable THHN 12AWG 500ft',
    'Conduit EMT 1/2" x 10ft', 'Conduit EMT 3/4" x 10ft', 'Switch Single Pole',
    'Switch 3-Way', 'Outlet Duplex 15A', 'Outlet GFCI 15A', 'Breaker 15A',
    'Breaker 20A', 'Breaker 30A', 'Panel Box 8 Circuit', 'Panel Box 12 Circuit',
    'Transformer 120V/24V 40VA', 'Transformer 240V/120V 500VA',
    'Fuse 5A', 'Fuse 10A', 'Fuse 15A', 'Terminal Block 12pt',
    'Cable Connector MC4', 'Junction Box 4x4',
  ];
  for (let i = 0; i < electrical.length; i++) {
    products.push({
      sku: `ELEC-${String(i + 31).padStart(3, '0')}`,
      name: electrical[i],
      description: null,
      price: Math.round((3.0 + i * 1.5) * 100) / 100,
      category: 'Electrical',
      supplierId: (i % 5) + 1,
    });
  }

  // HVAC (20 products)
  const hvac = [
    'Air Filter 16x25x1', 'Air Filter 20x25x1', 'Air Filter 20x25x4',
    'Duct Tape Silver 50yd', 'Duct Insulation 6" x 15ft', 'Flex Duct 6" x 25ft',
    'Thermostat Programmable', 'Thermostat Non-Programmable', 'Refrigerant R-410A 25lb',
    'Refrigerant R-134a 12oz', 'Capacitor 35/5 MFD', 'Capacitor 60+5 MFD',
    'Condensate Pump 120V', 'Blower Motor 1/2HP', 'Fan Blade 18" CW',
    'Thermostatic Expansion Valve', 'Sight Glass 1/4"', 'Filter Drier 3/8"',
    'Copper Fitting Sweat 3/4"', 'Flare Nut 1/4"',
  ];
  for (let i = 0; i < hvac.length; i++) {
    products.push({
      sku: `HVAC-${String(i + 1).padStart(3, '0')}`,
      name: hvac[i],
      description: null,
      price: Math.round((5.0 + i * 3.2) * 100) / 100,
      category: 'HVAC',
      supplierId: (i % 5) + 1,
    });
  }

  // Tools (20 products)
  const tools = [
    'Screwdriver Set 12pc', 'Wrench Set 14pc', 'Socket Set 40pc',
    'Multimeter Digital', 'Oscilloscope 2-Ch', 'Soldering Iron 60W',
    'Heat Gun 1500W', 'Drill Press Bench', 'Multitool Oscillating',
    'Wire Stripper Auto', 'Crimper Ratcheting', 'Torque Wrench 1/2"',
    'Caliper Digital 6"', 'Micrometer 0-1"', 'Level 24" Magnetic',
    'Tape Measure 25ft', 'Clamp C-Clamp 4"', 'Vise 4" Bench',
    'Hacksaw 10" Frame', 'File Set 6pc Assorted',
  ];
  for (let i = 0; i < tools.length; i++) {
    products.push({
      sku: `TOOL-${String(i + 1).padStart(3, '0')}`,
      name: tools[i],
      description: null,
      price: Math.round((8.0 + i * 4.5) * 100) / 100,
      category: 'Tools',
      supplierId: (i % 5) + 1,
    });
  }

  // Adhesives (16 products — brings total to 231)
  const adhesives = [
    'Epoxy 2-Part 5min', 'Epoxy 2-Part 30min', 'Super Glue 4g',
    'Super Glue Gel 4g', 'Thread Locker Blue', 'Thread Locker Red',
    'Silicone Sealant Clear', 'Silicone Sealant White', 'Polyurethane Adhesive',
    'Contact Cement 8oz', 'Wood Glue 8oz', 'Wood Glue 16oz',
    'Hot Glue Sticks 4" x 25pk', 'Double-Sided Tape 1" x 15ft',
    'Electrical Tape 3/4" x 60ft', 'PTFE Tape 1/2" x 260"',
  ];
  for (let i = 0; i < adhesives.length; i++) {
    products.push({
      sku: `ADHV-${String(i + 1).padStart(3, '0')}`,
      name: adhesives[i],
      description: null,
      price: Math.round((1.5 + i * 0.85) * 100) / 100,
      category: 'Adhesives',
      supplierId: (i % 5) + 1,
    });
  }

  return products;
}

async function main() {
  console.log('[seed] Starting idempotent seed...');

  // ── Users ────────────────────────────────────────────────────────────────────
  let userCreated = 0;
  let userSkipped = 0;

  for (const u of DEFAULT_USERS) {
    const existing = await prisma.user.findUnique({
      where: { username: u.username },
    });

    if (existing) {
      if (existing.passwordHash.startsWith('$2b$')) {
        console.log(`[seed] SKIP "${u.username}" — already exists and hashed`);
        userSkipped++;
      } else {
        const hashed = await bcrypt.hash(u.password, BCRYPT_COST);
        await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash: hashed },
        });
        console.log(`[seed] REHASH "${u.username}" — was plaintext, now hashed`);
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
      console.log(`[seed] CREATED "${u.username}" (isAdmin=${u.isAdmin})`);
      userCreated++;
    }
  }

  console.log(`[seed] Users — ${userCreated} created/rehashed, ${userSkipped} skipped`);

  // ── Suppliers ──────────────────────────────────────────────────────────────────

  let supplierCount = 0;
  for (const s of DEFAULT_SUPPLIERS) {
    const existing = await prisma.supplier.findFirst({ where: { name: s.name } });
    if (!existing) {
      await prisma.supplier.create({ data: s });
      supplierCount++;
    }
  }
  console.log(`[seed] Suppliers — ${supplierCount} created`);

  // ── Warehouses ─────────────────────────────────────────────────────────────────

  let warehouseCount = 0;
  for (const w of DEFAULT_WAREHOUSES) {
    const existing = await prisma.warehouse.findFirst({ where: { name: w.name } });
    if (!existing) {
      await prisma.warehouse.create({ data: w });
      warehouseCount++;
    }
  }
  console.log(`[seed] Warehouses — ${warehouseCount} created`);

  // ── Products (upsert by SKU) ──────────────────────────────────────────────────

  const products = generateProducts();
  let productCreated = 0;
  let productSkipped = 0;

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (existing) {
      productSkipped++;
      continue;
    }
    await prisma.product.create({
      data: {
        sku: p.sku,
        name: p.name,
        description: p.description,
        price: p.price,
        category: p.category,
        supplierId: p.supplierId,
      },
    });
    productCreated++;
  }
  console.log(`[seed] Products — ${productCreated} created, ${productSkipped} skipped (total: ${products.length})`);

  // ── Inventory Stock (product × warehouse, quantity=0) ──────────────────────────

  const allProducts = await prisma.product.findMany({ select: { id: true } });
  const allWarehouses = await prisma.warehouse.findMany({ select: { id: true } });

  let stockCreated = 0;
  const stockData = [];
  for (const product of allProducts) {
    for (const warehouse of allWarehouses) {
      stockData.push({
        productId: product.id,
        warehouseId: warehouse.id,
        quantity: 0,
      });
    }
  }

  // Prisma v7 removed skipDuplicates from createMany — insert individually with idempotency check
  for (const stock of stockData) {
    const existing = await prisma.inventoryStock.findUnique({
      where: {
        productId_warehouseId: {
          productId: stock.productId,
          warehouseId: stock.warehouseId,
        },
      },
    });
    if (!existing) {
      await prisma.inventoryStock.create({ data: stock });
      stockCreated++;
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