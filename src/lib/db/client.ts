import { neon } from "@neondatabase/serverless";

let _sql: ReturnType<typeof neon> | null = null;

/**
 * Lazy singleton: the neon() call throws if DATABASE_URL is unset, and
 * Next.js evaluates top-level module code at build time (before env vars
 * are provisioned on a first deploy), so this must not run at import time.
 */
export function getSql() {
  if (!_sql) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    _sql = neon(url);
  }
  return _sql;
}
