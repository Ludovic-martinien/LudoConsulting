import "server-only";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";

export { actionLabel } from "@/lib/activity-labels";

export type ActorType = "admin" | "member" | "anonymous" | "system";
export type EventResult = "success" | "failure";

type LogInput = {
  actor: string;
  actorType?: ActorType;
  action: string;
  entityType?: string;
  entityId?: string;
  result?: EventResult;
  details?: Record<string, string | number | boolean | null>;
};

/**
 * Journal d'audit unifié. Écrit côté serveur uniquement.
 * Ne jamais y enregistrer : mots de passe, jetons, secrets.
 * La colonne `admin_email` porte l'identifiant de l'acteur quel que soit son type
 * (réutilisation de la table existante, sans doublon de colonne) ;
 * `details.actorType` précise la nature de l'acteur.
 */
export async function logEvent(input: LogInput) {
  try {
    await db.insert(activityLogs).values({
      adminEmail: input.actor.slice(0, 254),
      action: input.action.slice(0, 120),
      entityType: input.entityType?.slice(0, 100) ?? null,
      entityId: input.entityId?.slice(0, 120) ?? null,
      details: {
        actorType: input.actorType ?? "admin",
        result: input.result ?? "success",
        ...(input.details ?? {}),
      },
    });
  } catch {
    /* Le journal ne doit jamais bloquer une opération métier. */
  }
}
