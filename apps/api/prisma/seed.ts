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

async function main() {
  console.log('[seed] Starting idempotent user seed...');

  let created = 0;
  let skipped = 0;

  for (const u of DEFAULT_USERS) {
    // Check if user already exists by username
    const existing = await prisma.user.findUnique({
      where: { username: u.username },
    });

    if (existing) {
      // User exists — verify password is already bcrypt-hashed
      if (existing.passwordHash.startsWith('$2b$')) {
        console.log(`[seed] SKIP "${u.username}" — already exists and hashed`);
        skipped++;
      } else {
        // Edge case: exists but plaintext (shouldn't happen after first run)
        const hashed = await bcrypt.hash(u.password, BCRYPT_COST);
        await prisma.user.update({
          where: { id: existing.id },
          data: { passwordHash: hashed },
        });
        console.log(`[seed] REHASH "${u.username}" — was plaintext, now hashed`);
        created++;
      }
    } else {
      // User doesn't exist — create with pre-hashed password
      const hashed = await bcrypt.hash(u.password, BCRYPT_COST);
      await prisma.user.create({
        data: {
          username: u.username,
          passwordHash: hashed,
          isAdmin: u.isAdmin,
        },
      });
      console.log(`[seed] CREATED "${u.username}" (isAdmin=${u.isAdmin})`);
      created++;
    }
  }

  console.log(`[seed] Done — ${created} created/rehashed, ${skipped} skipped`);
}

main()
  .catch((e) => {
    console.error('[seed] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
