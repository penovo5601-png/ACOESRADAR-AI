import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/**
 * A base de dados é OPCIONAL. Sem DATABASE_URL (ex.: deploy na Vercel sem Neon),
 * as rotas que a usam (watchlist, histórico, uploads) respondem com erro controlado
 * e o resto do site (análise, guia, carteiras, foto) funciona normalmente.
 */
const databaseUrl = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5432/app_db";
export const hasDatabase = Boolean(process.env.DATABASE_URL);

const globalForDb = globalThis as typeof globalThis & { __arenaNextJsPostgresqlPool?: Pool };

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({ connectionString: databaseUrl, connectionTimeoutMillis: 3000, max: 5 });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}
pool.on("error", (err) => console.error("[db] pool error:", err.message));

export const db = drizzle(pool);
