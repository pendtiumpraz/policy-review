import { db } from '@/lib/db';
import { usageCounters, usageRecords, tenants } from '@/lib/db/schema';
import { and, eq, gte, isNull, sql } from 'drizzle-orm';
import { requireUser, jsonOk } from '@/lib/server';

export async function GET() {
  const r = await requireUser();
  if ('error' in r) return r.error;

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, r.user.tenantId)).limit(1);
  const quota = tenant?.tokenQuota ?? 0;
  const period = new Date().toISOString().slice(0, 7);

  let monthUsed = 0;
  try {
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
    monthUsed = Number(monthRow[0]?.total ?? 0);
  } catch (e) {
    console.error('[usage] Baca usage_counters gagal — fallback ke usage_records bulan ini:', e);
    const monthRow = await db
      .select({ total: sql<number>`coalesce(sum(input_tokens + output_tokens), 0)` })
      .from(usageRecords)
      .where(
        and(
          eq(usageRecords.tenantId, r.user.tenantId),
          gte(usageRecords.createdAt, sql`date_trunc('month', now())`),
        ),
      );
    monthUsed = Number(monthRow[0]?.total ?? 0);
  }

  const lifeRow = await db
    .select({ total: sql<number>`coalesce(sum(input_tokens + output_tokens), 0)` })
    .from(usageRecords)
    .where(eq(usageRecords.tenantId, r.user.tenantId));

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
