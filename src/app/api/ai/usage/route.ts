import { db } from '@/lib/db';
import { usageCounters, usageRecords, tenants } from '@/lib/db/schema';
import { and, eq, isNull, sql } from 'drizzle-orm';
import { requireUser, jsonOk } from '@/lib/server';

export async function GET() {
  const r = await requireUser();
  if ('error' in r) return r.error;

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, r.user.tenantId)).limit(1);
  const quota = tenant?.tokenQuota ?? 0;
  const period = new Date().toISOString().slice(0, 7);

  const monthRow = await db
    .select({ total: sql<number>`coalesce(sum(tokens_in + tokens_out), 0)` })
    .from(usageCounters)
    .where(
      and(
        eq(usageCounters.tenantId, r.user.tenantId),
        eq(usageCounters.period, period),
        isNull(usageCounters.deletedAt),
      ),
    );

  const lifeRow = await db
    .select({ total: sql<number>`coalesce(sum(input_tokens + output_tokens), 0)` })
    .from(usageRecords)
    .where(eq(usageRecords.tenantId, r.user.tenantId));

  const monthUsed = Number(monthRow[0]?.total ?? 0);
  const lifetime = Number(lifeRow[0]?.total ?? 0);

  return jsonOk({
    total: monthUsed,
    monthUsed,
    lifetime,
    quota,
    unlimited: quota <= 0,
    remaining: quota > 0 ? Math.max(0, quota - monthUsed) : null,
  });
}
