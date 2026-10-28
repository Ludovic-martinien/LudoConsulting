import { eq } from "drizzle-orm";
import { db } from "@/db";
import { quoteRequests } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const statuses = ["new", "processing", "waiting", "quote_preparation", "replied", "accepted", "declined", "closed"];
export async function PATCH(request: Request, context: Context) {
  const auth = await authorizeAdmin(request, ["admin", "sales"]); if (isResponse(auth)) return auth;
  const id = Number((await context.params).id); if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  try { const body = await request.json() as Record<string, unknown>; const status = cleanText(body.status, 40); const internalNotes = cleanText(body.internalNotes, 10000); if (!statuses.includes(status)) return Response.json({ error: "Statut invalide." }, { status: 400 }); const [updated] = await db.update(quoteRequests).set({ status, internalNotes, updatedAt: new Date() }).where(eq(quoteRequests.id, id)).returning({ id: quoteRequests.id }); if (!updated) return Response.json({ error: "Demande introuvable." }, { status: 404 }); await logAdminAction(auth, "quote.status", "quote_request", String(id), { status }); return Response.json({ ok: true }); } catch { return Response.json({ error: "Modification impossible." }, { status: 500 }); }
}
