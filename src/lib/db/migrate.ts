/**
 * Minimal idempotent migrator: applies raw SQL migrations under ./migrations
 * in filename order, tracking applied ones in a `_migrations` table.
 * No drizzle-kit required at runtime — good for Vercel serverless deploy.
 */
import { sql } from './index';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import bcrypt from 'bcryptjs';
import { randomUUID as uuid } from 'node:crypto';

async function main() {
  await sql`CREATE TABLE IF NOT EXISTS _migrations (
    name text PRIMARY KEY,
    applied_at timestamptz DEFAULT now()
  )`;

  const dir = join(process.cwd(), 'migrations');
  let files: string[] = [];
  try {
    files = readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  } catch {
    console.log('No migrations directory; applying schema via inline SQL.');
  }

  const applied = new Set(
    (await sql`SELECT name FROM _migrations`).map((r) => r.name as string),
  );

  for (const file of files) {
    if (applied.has(file)) continue;
    const body = readFileSync(join(dir, file), 'utf8');
    await sql.unsafe(body);
    await sql`INSERT INTO _migrations (name) VALUES (${file})`;
    console.log('applied', file);
  }

  // Seed platform tenant + superadmin (idempotent).
  const platformName = 'Platform';
  let platform = (await sql`
    SELECT id FROM tenants WHERE slug = 'platform' AND deleted_at IS NULL
  `)[0];

  if (!platform) {
    const id = uuid();
    await sql`INSERT INTO tenants (id, name, slug, is_platform, brand_primary_color)
      VALUES (${id}, ${platformName}, 'platform', true, '#10b981')`;
    platform = { id };
  }

  const email = process.env.SUPERADMIN_EMAIL || 'admin@example.com';
  const existing = (await sql`SELECT id FROM users WHERE email = ${email}`)[0];
  if (!existing) {
    const password = process.env.SUPERADMIN_PASSWORD || 'admin12345';
    const hash = await bcrypt.hash(password, 12);
    await sql`INSERT INTO users (id, tenant_id, email, role, status, name, password_hash)
      VALUES (${uuid()}, ${platform.id}, ${email}, 'superadmin', 'active', 'Super Admin', ${hash})`;
    console.log('seeded superadmin', email);
  }

  console.log('migrate complete');
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
