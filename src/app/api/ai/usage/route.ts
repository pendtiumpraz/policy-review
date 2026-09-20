import { db } from '@/lib/db';
import { usageRecords, tenants } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { requireUser, jsonOk } from '@/lib/server';

export async function GET() {
  const r = await requireUser();
  if ('error' in r) return r.error;

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, r.user.tenantId)).limit(1);
  const row = await db
    .select({ total: sql<number>`coalesce(sum(input_tokens + output_tokens), 0)` })
    .from(usageRecords)
    .where(eq(usageRecords.tenantId, r.user.tenantId));

  const total = Number(row[0]?.total ?? 0);
  const quota = tenant?.tokenQuota ?? 0;

  return jsonOk({
    total,
    quota,
    unlimited: quota <= 0,
    remaining: quota > 0 ? Math.max(0, quota - total) : null,
  });
}
