/**
 * Create a tenant + admin user (idempotent). Usage:
 *   npm run create:tenant -- <name> <slug> <email> <password>
 */
import { randomUUID as uuid } from 'node:crypto';
import bcrypt from 'bcryptjs';
import { sql } from '@/lib/db';

async function main() {
  const [name, slugRaw, email, password] = process.argv.slice(2);
  if (!name || !slugRaw || !email || !password) {
    console.error('usage: create-tenant <name> <slug> <email> <password>');
    process.exit(1);
  }
  const slug = slugRaw.toLowerCase().replace(/[^a-z0-9-]/g, '-');
  const emailLower = email.toLowerCase();

  let tenant = (await sql`SELECT id FROM tenants WHERE slug = ${slug} AND deleted_at IS NULL`)[0];
  if (!tenant) {
    tenant = { id: uuid() };
    await sql`INSERT INTO tenants (id, name, slug, brand_primary_color)
      VALUES (${tenant.id}, ${name}, ${slug}, '#1b9e4b')`;
    console.log('created tenant', name);
  } else {
    console.log('tenant exists', name);
  }

  const existing = (await sql`SELECT id FROM users WHERE email = ${emailLower}`)[0];
  if (!existing) {
    const hash = await bcrypt.hash(password, 12);
    await sql`INSERT INTO users (id, tenant_id, email, role, status, name, password_hash)
      VALUES (${uuid()}, ${tenant.id}, ${emailLower}, 'admin', 'active', ${name + ' Admin'}, ${hash})`;
    console.log('created admin', emailLower);
  } else {
    console.log('admin exists', emailLower);
  }

  console.log('TENANT_ID=' + tenant.id);
  console.log('SLUG=' + slug);
  console.log('EMAIL=' + emailLower);
  await sql.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
