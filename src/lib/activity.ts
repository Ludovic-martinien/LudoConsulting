import "server-only";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";

export type ActorType = "admin" | "member" | "anonymous" | "system";

/** Adresse IP de l'appelant (via proxy), tronquée. Réservée à l'audit admin. */
export function clientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0].trim();
    if (first) return first.slice(0, 64);
  }
  const real = request.headers.get("x-real-ip");
  return real ? real.trim().slice(0, 64) : null;
}

export async function logEvent(input: {
  action: string;
  actorType?: ActorType;
  actorEmail?: string | null;
  actorId?: string | number | null;
  entityType?: string | null;
  entityId?: string | number | null;
  details?: Record<string, string | number | boolean | null>;
  success?: boolean;
  ip?: string | null;
}): Promise<void> {
  try {
    await db.insert(activityLogs).values({
      adminEmail: input.actorEmail ?? null,
      actorType: input.actorType ?? "system",
      actorId: input.actorId == null ? null : String(input.actorId),
      action: input.action,
      entityType: input.entityType ?? null,
      entityId: input.entityId == null ? null : String(input.entityId),
      details: input.details ?? {},
      success: input.success ?? true,
      ip: input.ip ?? null,
    });
  } catch {
    /* Le journal ne doit jamais casser l'opération principale. */
  }
}
