import { eq } from "drizzle-orm";
import { db } from "@/db";
import { projectDocuments } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };

function parsedId(value: string) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(request: Request, context: Context) {
  const auth = await authorizeAdmin(request, ["admin", "editor"]);
  if (isResponse(auth)) return auth;
  const id = parsedId((await context.params).id);
  if (!id) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const updates: { titleFr?: string; titleEn?: string; projectSlug?: string | null; isPublished?: boolean } = {};
    if (body.titleFr !== undefined) {
      const titleFr = cleanText(body.titleFr, 240);
      if (titleFr.length < 2) return Response.json({ error: "Le titre français est obligatoire." }, { status: 400 });
      updates.titleFr = titleFr;
    }
    if (body.titleEn !== undefined) updates.titleEn = cleanText(body.titleEn, 240);
    if (body.projectSlug !== undefined) {
      const slug = cleanText(body.projectSlug, 180);
      updates.projectSlug = slug || null;
    }
    if (body.isPublished !== undefined) {
      if (typeof body.isPublished !== "boolean") return Response.json({ error: "Statut invalide." }, { status: 400 });
      updates.isPublished = body.isPublished;
    }
    if (Object.keys(updates).length === 0) return Response.json({ error: "Aucune modification." }, { status: 400 });
    const [updated] = await db.update(projectDocuments).set({ ...updates, updatedAt: new Date() })
      .where(eq(projectDocuments.id, id)).returning({ id: projectDocuments.id });
    if (!updated) return Response.json({ error: "Document introuvable." }, { status: 404 });
    await logAdminAction(auth, "document.update", "project_document", String(id));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "Modification impossible." }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: Context) {
  const auth = await authorizeAdmin(request, ["admin", "editor"]);
  if (isResponse(auth)) return auth;
  const id = parsedId((await context.params).id);
  if (!id) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  const [removed] = await db.delete(projectDocuments).where(eq(projectDocuments.id, id)).returning({ id: projectDocuments.id });
  if (!removed) return Response.json({ error: "Document introuvable." }, { status: 404 });
  await logAdminAction(auth, "document.delete", "project_document", String(id));
  return Response.json({ ok: true });
}
