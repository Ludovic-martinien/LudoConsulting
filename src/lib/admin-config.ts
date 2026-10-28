import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

/**
 * Identifiants admin : variables d'environnement en priorité,
 * secours en base de données (site_settings.admin_credentials).
 * Le secours garantit que l'accès admin survit à une
 * réinitialisation du fichier .env de l'environnement.
 */
export async function ensureAdminEnv(): Promise<void> {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const hasEnv =
    process.env.ADMIN_EMAIL?.trim() &&
    process.env.ADMIN_PASSWORD_HASH?.trim() &&
    (process.env.ADMIN_SESSION_SECRET?.length ?? 0) >= 32;
  if (hasEnv) return;
  try {
    const [row] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, "admin_credentials"))
      .limit(1);
    const v = row?.value as { email?: unknown; passwordHash?: unknown; sessionSecret?: unknown } | undefined;
    if (
      v &&
      typeof v.email === "string" && v.email.trim() &&
      typeof v.passwordHash === "string" && v.passwordHash.trim() &&
      typeof v.sessionSecret === "string" && v.sessionSecret.length >= 32
    ) {
      if (!process.env.ADMIN_EMAIL?.trim()) process.env.ADMIN_EMAIL = v.email.trim();
      if (!process.env.ADMIN_PASSWORD_HASH?.trim()) process.env.ADMIN_PASSWORD_HASH = v.passwordHash.trim();
      if ((process.env.ADMIN_SESSION_SECRET?.length ?? 0) < 32) process.env.ADMIN_SESSION_SECRET = v.sessionSecret;
    }
  } catch {
    /* base indisponible au démarrage : le login répondra 503 comme avant */
  }
}
