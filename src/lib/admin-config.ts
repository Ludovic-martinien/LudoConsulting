import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { siteSettings } from "@/db/schema";

export type AdminCredentials = { email: string; passwordHash: string; sessionSecret: string };

function validCreds(v: { email?: unknown; passwordHash?: unknown; sessionSecret?: unknown } | undefined): AdminCredentials | null {
  if (
    v &&
    typeof v.email === "string" && v.email.trim() &&
    typeof v.passwordHash === "string" && v.passwordHash.trim() &&
    typeof v.sessionSecret === "string" && v.sessionSecret.length >= 32
  ) {
    return { email: v.email.trim().toLowerCase(), passwordHash: v.passwordHash.trim(), sessionSecret: v.sessionSecret };
  }
  return null;
}

/**
 * Identifiants admin : ligne gérée en base en priorité
 * (modifiable depuis l'interface Mon profil), variables
 * d'environnement en secours (amorçage initial).
 * Pour revenir aux variables d'environnement, supprimer la ligne
 * site_settings.admin_credentials puis redémarrer.
 */
export async function getAdminCredentials(): Promise<AdminCredentials | null> {
  try {
    const [row] = await db
      .select({ value: siteSettings.value })
      .from(siteSettings)
      .where(eq(siteSettings.key, "admin_credentials"))
      .limit(1);
    const fromDb = validCreds(row?.value as { email?: unknown; passwordHash?: unknown; sessionSecret?: unknown } | undefined);
    if (fromDb) return fromDb;
  } catch {
    /* base indisponible : repli sur l'environnement */
  }
  return validCreds({
    email: process.env.ADMIN_EMAIL,
    passwordHash: process.env.ADMIN_PASSWORD_HASH,
    sessionSecret: process.env.ADMIN_SESSION_SECRET,
  });
}

export async function saveAdminCredentials(creds: AdminCredentials): Promise<void> {
  await db
    .insert(siteSettings)
    .values({ key: "admin_credentials", value: { ...creds } })
    .onConflictDoUpdate({ target: siteSettings.key, set: { value: { ...creds } } });
}

/** Remplit les variables manquantes au démarrage pour le code synchrone. */
export async function ensureAdminEnv(): Promise<void> {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const creds = await getAdminCredentials().catch(() => null);
  if (!creds) return;
  if (!process.env.ADMIN_EMAIL?.trim()) process.env.ADMIN_EMAIL = creds.email;
  if (!process.env.ADMIN_PASSWORD_HASH?.trim()) process.env.ADMIN_PASSWORD_HASH = creds.passwordHash;
  if ((process.env.ADMIN_SESSION_SECRET?.length ?? 0) < 32) process.env.ADMIN_SESSION_SECRET = creds.sessionSecret;
}
