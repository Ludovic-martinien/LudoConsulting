import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import MIGRATIONS from "./migrations-data.json";

const globalForMigrate = globalThis as typeof globalThis & { __ludoMigrated?: boolean };

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** Codes PostgreSQL signifiant « existe déjà » : on considère l'élément appliqué. */
function isAlreadyExists(error: unknown) {
  const code = (error as { code?: string } | null)?.code;
  return code === "42P07" || code === "42710" || code === "42P06";
}

/**
 * Migration automatique au démarrage : applique dans l'ordre les migrations
 * embarquées qui manquent, en suivant les tags déjà appliqués.
 * - Chaque fichier SQL transite par le protocole simple PostgreSQL : les
 *   instructions sont rejouables et les conflits « existe déjà » (démarrages
 *   concurrents, reprise après interruption) sont traités comme « appliqué ».
 * - Le drapeau mémoire n'est posé qu'après un cycle complet réussi ; en cas
 *   d'échec persistant, la prochaine requête réessaiera et les pages savent
 *   se dégrader en attendant (jamais de crash 500 pour cette raison).
 * - Les migrations destructrices futures devront être relues avant déploiement.
 */
export async function ensureMigrations() {
  if (globalForMigrate.__ludoMigrated) return;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await db.execute(sql`CREATE TABLE IF NOT EXISTS "_app_migrations" ("tag" text PRIMARY KEY, "applied_at" timestamptz DEFAULT now())`);
      const appliedRows = await db.execute<{ tag: string }>(sql`SELECT "tag" FROM "_app_migrations"`);
      const applied = new Set(appliedRows.rows.map((row) => row.tag));
      let failed = false;
      for (const migration of (MIGRATIONS as { tag: string; sql: string }[])) {
        if (applied.has(migration.tag)) continue;
        try {
          await db.execute(sql.raw(migration.sql));
          await db.execute(sql`INSERT INTO "_app_migrations" ("tag") VALUES (${migration.tag}) ON CONFLICT DO NOTHING`);
        } catch (error) {
          if (isAlreadyExists(error)) {
            await db.execute(sql`INSERT INTO "_app_migrations" ("tag") VALUES (${migration.tag}) ON CONFLICT DO NOTHING`);
            continue;
          }
          failed = true;
          break;
        }
      }
      if (!failed) {
        globalForMigrate.__ludoMigrated = true;
        return;
      }
    } catch (error) {
      console.error(`Migration automatique (tentative ${attempt + 1}):`, error instanceof Error ? error.message : error);
    }
    await sleep(200 * (attempt + 1));
  }
}
