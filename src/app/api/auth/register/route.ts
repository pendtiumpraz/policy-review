import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users, tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { jsonOk, jsonError } from '@/lib/server';

const schema = z.object({
  name: z.string().min(2),
  orgName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 40) + `-${Math.random().toString(36).slice(2, 7)}`
  );
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return jsonError('Data tidak valid', 422, parsed.error.flatten().fieldErrors);
  }
  const { name, orgName, email, password } = parsed.data;

  const existing = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  if (existing.length) return jsonError('Email sudah terdaftar', 409);

  // Create tenant + admin user.
  const [tenant] = await db
    .insert(tenants)
    .values({ name: orgName, slug: slugify(orgName) })
    .returning();

  const hash = await bcrypt.hash(password, 12);
  await db.insert(users).values({
    tenantId: tenant.id,
    email: email.toLowerCase(),
    name,
    role: 'admin',
    status: 'active',
    passwordHash: hash,
  });

  return jsonOk({ tenantId: tenant.id }, 201);
}
