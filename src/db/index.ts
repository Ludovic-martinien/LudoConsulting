import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

type Db = NodePgDatabase<typeof schema>;

const globalForDb = globalThis as typeof globalThis & {
  __ludoDb?: Db;
};

function createDb(): Db {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }
  return drizzle(new Pool({ connectionString: databaseUrl }), { schema });
}

function getDb(): Db {
  if (!globalForDb.__ludoDb) {
    globalForDb.__ludoDb = createDb();
  }
  return globalForDb.__ludoDb;
}

/**
 * Client Drizzle à initialisation différée : le simple import de ce module
 * n'échoue plus quand DATABASE_URL est absente (ex. compilation sur Vercel
 * avant la configuration des variables). L'erreur explicite survient
 * uniquement à la première requête réellement exécutée.
 */
export const db: Db = new Proxy({} as Db, {
  get: (_target, property) => {
    const instance = getDb();
    const value = (instance as unknown as Record<PropertyKey, unknown>)[property];
    return typeof value === "function" ? (value as Function).bind(instance) : value;
  },
});
