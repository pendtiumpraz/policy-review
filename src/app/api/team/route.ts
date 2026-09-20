import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { requireUser, jsonOk, jsonError } from '@/lib/server';
import { z } from 'zod';

export async function GET() {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const rows = await db
    .select({ id: users.id, name: users.name, email: users.email, role: users.role, status: users.status })
    .from(users)
    .where(and(eq(users.tenantId, r.user.tenantId), isNull(users.deletedAt)));
  return jsonOk(rows);
}

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'member']).default('member'),
});

export async function POST(req: NextRequest) {
  const r = await requireUser();
  if ('error' in r) return r.error;
  const body = await req.json().catch(() => null);
  const p = schema.safeParse(body);
  if (!p.success) return jsonError('Data tidak valid', 422, p.error.flatten().fieldErrors);

  const existing = await db.select().from(users).where(eq(users.email, p.data.email.toLowerCase())).limit(1);
  if (existing.length) return jsonError('Email sudah terdaftar', 409);

  const hash = await bcrypt.hash(p.data.password, 12);
  const [row] = await db
    .insert(users)
    .values({
      tenantId: r.user.tenantId,
      email: p.data.email.toLowerCase(),
      name: p.data.name,
      role: p.data.role,
      status: 'active',
      passwordHash: hash,
    })
    .returning();
  return jsonOk({ id: row.id, name: row.name, email: row.email, role: row.role }, 201);
}
