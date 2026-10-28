import "server-only";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { MEMBER_COOKIE, verifyMemberToken } from "@/lib/member-auth";
import { getAdminSession } from "@/lib/auth";

/**
 * Bloque l'accès aux pages réservées (Services, Réalisations, Formations, Tarifs).
 * Autorise les membres connectés et les administrateurs ; sinon redirige vers
 * l'accueil qui ouvre automatiquement la fenêtre de connexion.
 */
export async function requireMemberOrAdmin(): Promise<void> {
  try {
    const admin = await getAdminSession().catch(() => null);
    if (admin) return;
  } catch {
    /* pas de session admin : vérifier le membre */
  }
  try {
    const store = await cookies();
    const session = await verifyMemberToken(store.get(MEMBER_COOKIE)?.value);
    if (session) {
      const [user] = await db
        .select({ id: users.id, tokenVersion: users.tokenVersion, isActive: users.isActive })
        .from(users)
        .where(eq(users.id, session.uid))
        .limit(1);
      if (user && user.tokenVersion === session.tv && user.isActive !== false) return;
    }
  } catch {
    /* session membre invalide */
  }
  redirect("/?auth=required");
}
