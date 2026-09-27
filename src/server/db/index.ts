import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { createRequire } from 'node:module';
import * as schema from './schema';

export type DatabaseInstance = any;

let localDb: any = null;
let underlyingSqlite: any = null;

function getLazyRequire() {
  const metaUrl = typeof import.meta !== 'undefined' && import.meta.url ? import.meta.url : 'file:///app/index.js';
  return createRequire(metaUrl);
}

export function getDb(d1Binding?: D1Database, forceFresh = false): DatabaseInstance {
  if (d1Binding) {
    return drizzleD1(d1Binding, { schema });
  }

  if (!localDb || forceFresh) {
    const req = getLazyRequire();
    const dbUrl = (typeof process !== 'undefined' && process.env.DATABASE_URL) || './local.db';
    if (typeof (globalThis as any).Bun !== 'undefined') {
      const { Database } = req('bun:sqlite');
      const { drizzle } = req('drizzle-orm/bun-sqlite');
      underlyingSqlite = new Database(dbUrl);
      underlyingSqlite.run('PRAGMA journal_mode = WAL;');
      underlyingSqlite.run('PRAGMA foreign_keys = ON;');
      localDb = drizzle(underlyingSqlite, { schema });
    } else {
      const Database = req('better-sqlite3');
      const { drizzle } = req('drizzle-orm/better-sqlite3');
      underlyingSqlite = new Database(dbUrl);
      underlyingSqlite.pragma('journal_mode = WAL');
      underlyingSqlite.pragma('foreign_keys = ON');
      localDb = drizzle(underlyingSqlite, { schema });
    }

    try {
      const { runMigrations } = req('./migrate');
      runMigrations(underlyingSqlite);
    } catch {}
  }

  return localDb;
}

export function getUnderlyingSqlite(): any {
  if (!underlyingSqlite) {
    getDb();
  }
  return underlyingSqlite;
}

export { schema };
