import { db, sql as pgSql } from '@/lib/db';
import { aiModels, aiProviders, tenantAiKeys, tenants, usageCounters, usageRecords } from '@/lib/db/schema';
import { eq, and, isNull, sql } from 'drizzle-orm';
import { decryptSecret } from '@/lib/crypto';
import { chat, type AiRequest } from './client';
import { providerByCode } from './catalog';

export class AiQuotaExceeded extends Error {
  constructor() {
    super('Kuota token tenant telah habis. Hubungi administrator.');
    this.name = 'AiQuotaExceeded';
  }
}

export class AiNoKey extends Error {
  constructor(provider: string) {
    super(`Belum ada API key untuk provider ${provider}. Konfigurasikan di Pengaturan AI.`);
    this.name = 'AiNoKey';
  }
}

export interface ResolvedAi {
  providerCode: string;
  model: string;
  providerId: string;
  modelId: string;
  request: AiRequest;
}

/** The platform (superadmin) tenant id — holds platform AI keys. */
export async function platformTenantId(): Promise<string | undefined> {
  const [t] = await db.select().from(tenants).where(eq(tenants.isPlatform, true)).limit(1);
  return t?.id;
}

/** Does the given tenant have an enabled API key (in DB) for this provider? */
export async function providerHasKey(providerId: string, tenantId: string): Promise<boolean> {
  const [k] = await db
    .select()
    .from(tenantAiKeys)
    .where(
      and(
        eq(tenantAiKeys.providerId, providerId),
        eq(tenantAiKeys.tenantId, tenantId),
        eq(tenantAiKeys.enabled, true),
        isNull(tenantAiKeys.deletedAt),
      ),
    )
    .limit(1);
  return !!k;
}

/**
 * Resolve the AI provider + model + key for a tenant.
 * API keys are stored ONLY in the database (never process.env):
 *   1. tenant BYOK key (this tenant)
 *   2. platform key (stored under the platform tenant)
 */
export async function resolveAi(
  tenantId: string,
  modelId?: string | null,
  providerId?: string | null,
): Promise<ResolvedAi> {
  let providerRow = providerId
    ? (await db.select().from(aiProviders).where(and(eq(aiProviders.id, providerId), eq(aiProviders.enabled, true))).limit(1))[0]
    : undefined;

  let modelRow = modelId
    ? (await db.select().from(aiModels).where(and(eq(aiModels.id, modelId), eq(aiModels.enabled, true))).limit(1))[0]
    : undefined;

  // Default to first enabled model if none chosen.
  if (!modelRow) {
    const rows = await db.select().from(aiModels).where(eq(aiModels.enabled, true)).limit(20);
    modelRow = providerId
      ? rows.find((m) => m.providerId === providerId) || rows[0]
      : rows[0];
  }
  if (!modelRow) throw new AiNoKey('(tidak ada model aktif)');

  if (!providerRow) {
    providerRow = (await db
      .select()
      .from(aiProviders)
      .where(and(eq(aiProviders.id, modelRow.providerId), eq(aiProviders.enabled, true)))
      .limit(1))[0];
  }
  if (!providerRow) throw new AiNoKey('(provider tidak aktif)');

  const p = providerByCode(providerRow.code);

  // 1. Tenant BYOK key.
  const byok = await db
    .select()
    .from(tenantAiKeys)
    .where(
      and(
        eq(tenantAiKeys.tenantId, tenantId),
        eq(tenantAiKeys.providerId, providerRow.id),
        eq(tenantAiKeys.enabled, true),
        isNull(tenantAiKeys.deletedAt),
      ),
    )
    .limit(1);

  let apiKey: string | undefined;
  if (byok[0]) {
    apiKey = decryptSecret(byok[0].apiKeyCipher);
  } else {
    // Platform key (DB) — stored under the platform tenant.
    const payload = await platformTenantId();
    if (payload) {
      const [pk] = await db
        .select()
        .from(tenantAiKeys)
        .where(
          and(
            eq(tenantAiKeys.tenantId, payload),
            eq(tenantAiKeys.providerId, providerRow.id),
            eq(tenantAiKeys.enabled, true),
            isNull(tenantAiKeys.deletedAt),
          ),
        )
        .limit(1);
      if (pk) apiKey = decryptSecret(pk.apiKeyCipher);
    }
  }

  if (!apiKey) throw new AiNoKey(providerRow.name);

  // The tenant BYOK row's own base_url takes precedence (was ignored before).
  const baseUrl = byok[0]?.baseUrl || providerRow.baseUrl || p?.baseUrl;

  return {
    providerCode: providerRow.code,
    model: modelRow.modelId,
    providerId: providerRow.id,
    modelId: modelRow.id,
    request: { provider: providerRow.code, model: modelRow.modelId, apiKey, baseUrl },
  };
}

/** Enforce token quota (0 = unlimited) against the CURRENT month counter. */
async function enforceQuota(tenantId: string): Promise<void> {
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId)).limit(1);
  if (!tenant || tenant.tokenQuota <= 0) return;
  const period = new Date().toISOString().slice(0, 7);
  const row = await db
    .select({ total: sql<number>`coalesce(sum(tokens_in + tokens_out), 0)` })
    .from(usageCounters)
    .where(
      and(
        eq(usageCounters.tenantId, tenantId),
        eq(usageCounters.period, period),
        isNull(usageCounters.deletedAt),
      ),
    );
  const used = Number(row[0]?.total ?? 0);
  if (used >= tenant.tokenQuota) throw new AiQuotaExceeded();
}

/** Atomic monthly counter increment (upsert per tenant+period). */
async function bumpCounter(tenantId: string, tokensIn: number, tokensOut: number): Promise<void> {
  const period = new Date().toISOString().slice(0, 7);
  await pgSql`
    insert into usage_counters (tenant_id, period, tokens_in, tokens_out)
    values (${tenantId}, ${period}, ${tokensIn}, ${tokensOut})
    on conflict (tenant_id, period) where deleted_at is null
    do update set
      tokens_in = usage_counters.tokens_in + excluded.tokens_in,
      tokens_out = usage_counters.tokens_out + excluded.tokens_out,
      updated_at = now()
  `;
}

export async function runAi(
  tenantId: string,
  systemPrompt: string,
  userPrompt: string,
  opts: { operation: string; modelId?: string | null; providerId?: string | null; maxTokens?: number } = { operation: 'review' },
) {
  await enforceQuota(tenantId);
  const resolved = await resolveAi(tenantId, opts.modelId, opts.providerId);
  const result = await chat(resolved.request, systemPrompt, userPrompt, opts.maxTokens ?? 4000);

  await bumpCounter(tenantId, result.inputTokens, result.outputTokens);

  await db.insert(usageRecords).values({
    tenantId,
    providerId: resolved.providerId,
    modelId: resolved.modelId,
    operation: opts.operation,
    inputTokens: result.inputTokens,
    outputTokens: result.outputTokens,
  });

  return { ...result, resolved };
}
