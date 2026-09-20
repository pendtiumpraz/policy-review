import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

declare global {
  // eslint-disable-next-line no-var
  var __db: ReturnType<typeof drizzle<typeof schema>> | undefined;
  // eslint-disable-next-line no-var
  var __sql: ReturnType<typeof postgres> | undefined;
}

const sql =
  globalThis.__sql ??
  postgres(connectionString, {
    ssl: 'require',
    max: process.env.NODE_ENV === 'production' ? 1 : 10,
  });

export { sql };

export const db =
  globalThis.__db ?? drizzle(sql, { schema });

if (process.env.NODE_ENV !== 'production') {
  globalThis.__db = db;
  globalThis.__sql = sql;
}

export type Db = typeof db;
