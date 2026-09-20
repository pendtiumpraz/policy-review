import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import type { ReviewResult, RegulationChecklistEntry } from '@/lib/types';

/**
 * Sainskerta-compliant schema (RULES-OF-THE-GAME):
 *  • No foreign keys (Rule #2) — plain *_id columns + index.
 *  • Soft delete (Rule #3) — every table has deleted_at; never hard-delete.
 *  • Multi-tenant isolation via tenant_id column scoping.
 *
 * NOTE: Drizzle maps camelCase TS properties to snake_case DB columns and
 * returns camelCase keys at runtime. The API therefore returns camelCase
 * JSON, and the frontend consumes camelCase. Keep them in sync.
 */

const stamps = {
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
};

/* ── tenants → whitelabel org + AI quota ─────────────────────────── */
export const tenants = pgTable('tenants', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  brandPrimaryColor: text('brand_primary_color').default('#10b981').notNull(),
  brandLogoUrl: text('brand_logo_url'),
  tokenQuota: integer('token_quota').default(0).notNull(),
  isPlatform: boolean('is_platform').default(false).notNull(),
  ...stamps,
}, (t) => ({
  deletedIdx: index('idx_tenants_deleted_at').on(t.deletedAt),
}));

/* ── users ───────────────────────────────────────────────────────── */
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  email: text('email').notNull().unique(),
  name: text('name'),
  role: text('role').default('member').notNull(), // superadmin | admin | member
  passwordHash: text('password_hash'),
  status: text('status').default('active').notNull(),
  ...stamps,
}, (t) => ({
  tenantIdx: index('idx_users_tenant_id').on(t.tenantId),
  deletedIdx: index('idx_users_deleted_at').on(t.deletedAt),
}));

/* ── AI providers (superadmin-managed catalog) ──────────────────── */
export const aiProviders = pgTable('ai_providers', {
  id: uuid('id').defaultRandom().primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  baseUrl: text('base_url'),
  enabled: boolean('enabled').default(true).notNull(),
  ...stamps,
}, (t) => ({
  deletedIdx: index('idx_ai_providers_deleted_at').on(t.deletedAt),
}));

/* ── AI models (superadmin-managed, tied to provider) ───────────── */
export const aiModels = pgTable('ai_models', {
  id: uuid('id').defaultRandom().primaryKey(),
  providerId: uuid('provider_id').notNull(),
  name: text('name').notNull(),
  modelId: text('model_id').notNull(),
  description: text('description'),
  enabled: boolean('enabled').default(true).notNull(),
  ...stamps,
}, (t) => ({
  providerIdx: index('idx_ai_models_provider_id').on(t.providerId),
  deletedIdx: index('idx_ai_models_deleted_at').on(t.deletedAt),
  uniq: uniqueIndex('uq_ai_models_provider_model').on(t.providerId, t.modelId),
}));

/* ── tenant BYOK keys (encrypted at rest) ────────────────────────── */
export const tenantAiKeys = pgTable('tenant_ai_keys', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  providerId: uuid('provider_id').notNull(),
  apiKeyCipher: text('api_key_cipher').notNull(),
  baseUrl: text('base_url'),
  enabled: boolean('enabled').default(true).notNull(),
  ...stamps,
}, (t) => ({
  tenantIdx: index('idx_tenant_ai_keys_tenant_id').on(t.tenantId),
  providerIdx: index('idx_tenant_ai_keys_provider_id').on(t.providerId),
  deletedIdx: index('idx_tenant_ai_keys_deleted_at').on(t.deletedAt),
}));

/* ── usage / quota telemetry ─────────────────────────────────────── */
export const usageRecords = pgTable('usage_records', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  providerId: uuid('provider_id'),
  modelId: uuid('model_id'),
  operation: text('operation').notNull(),
  inputTokens: integer('input_tokens').default(0).notNull(),
  outputTokens: integer('output_tokens').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  tenantIdx: index('idx_usage_records_tenant_id').on(t.tenantId),
  createdIdx: index('idx_usage_records_created_at').on(t.createdAt),
}));

/* ── regulations (internal + external) ───────────────────────────── */
export const regulations = pgTable('regulations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  title: text('title').notNull(),
  kind: text('kind').default('external').notNull(),
  source: text('source'),
  description: text('description'),
  content: text('content'),
  fileName: text('file_name'),
  filePath: text('file_path'),
  checklist: jsonb('checklist').$type<{ id: string; text: string }[]>().default([]),
  createdBy: uuid('created_by'),
  ...stamps,
}, (t) => ({
  tenantIdx: index('idx_regulations_tenant_id').on(t.tenantId),
  deletedIdx: index('idx_regulations_deleted_at').on(t.deletedAt),
}));

/* ── documents (policy/SOP being reviewed) ───────────────────────── */
export const documents = pgTable('documents', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  title: text('title').notNull(),
  docType: text('doc_type').default('kebijakan_privasi').notNull(),
  extractedText: text('extracted_text'),
  fileName: text('file_name'),
  filePath: text('file_path'),
  createdBy: uuid('created_by'),
  ...stamps,
}, (t) => ({
  tenantIdx: index('idx_documents_tenant_id').on(t.tenantId),
  deletedIdx: index('idx_documents_deleted_at').on(t.deletedAt),
}));

/* ── reviews ─────────────────────────────────────────────────────── */
export const reviews = pgTable('reviews', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  title: text('title').notNull(),
  docType: text('doc_type').default('kebijakan_privasi').notNull(),
  documentId: uuid('document_id'),
  regulationIds: jsonb('regulation_ids').$type<string[]>().default([]),
  regulationChecklist: jsonb('regulation_checklist')
    .$type<RegulationChecklistEntry[]>()
    .default([]),
  status: text('status').default('pending').notNull(),
  riskScore: integer('risk_score').default(0).notNull(),
  reviewSummary: jsonb('review_summary').$type<ReviewResult | null>(),
  errorMessage: text('error_message'),
  providerId: uuid('provider_id'),
  modelId: uuid('model_id'),
  createdBy: uuid('created_by'),
  ...stamps,
}, (t) => ({
  tenantIdx: index('idx_reviews_tenant_id').on(t.tenantId),
  deletedIdx: index('idx_reviews_deleted_at').on(t.deletedAt),
}));

/* ── review_sections (editable per-section, one-by-one) ──────────── */
export const reviewSections = pgTable('review_sections', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  reviewId: uuid('review_id').notNull(),
  sectionTitle: text('section_title').notNull(),
  status: text('status').default('missing').notNull(),
  score: integer('score').default(0).notNull(),
  gapDescription: text('gap_description'),
  recommendation: text('recommendation'),
  reference: text('reference'),
  sortOrder: integer('sort_order').default(0).notNull(),
  ...stamps,
}, (t) => ({
  reviewIdx: index('idx_review_sections_review_id').on(t.reviewId),
  tenantIdx: index('idx_review_sections_tenant_id').on(t.tenantId),
  deletedIdx: index('idx_review_sections_deleted_at').on(t.deletedAt),
}));
