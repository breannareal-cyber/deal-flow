import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Use @neondatabase/serverless + drizzle-orm/neon-http (NOT node-postgres):
// node-postgres works locally but fails on Vercel serverless functions.
//
// LAZY by design: the client is built on first query, not at import. Importing
// the storage barrel must NOT require DATABASE_URL — it's absent in local
// JSON-store mode, in unit tests, and at build time. Constructing eagerly there
// would throw on `neon(undefined)`.

type DB = ReturnType<typeof drizzle<typeof schema>>;

let _db: DB | null = null;

function getDb(): DB {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not set — Neon storage requires it.');
    }
    _db = drizzle(neon(process.env.DATABASE_URL), { schema });
  }
  return _db;
}

// Proxy so callers keep using `db.select()...` unchanged; the real client is
// materialized on first property access.
export const db = new Proxy({} as DB, {
  get(_target, prop) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? (value as (...a: unknown[]) => unknown).bind(real) : value;
  },
});
