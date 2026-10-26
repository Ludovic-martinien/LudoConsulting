import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { projectCategories, projects } from "@/db/schema";
import { authorizeAdmin, isResponse, logAdminAction } from "@/lib/admin-api";
import { cleanText } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const statuses = ["completed", "in_progress", "prototype", "testing", "conceptual", "preparation", "to-confirm"];
function lines(value: unknown, max = 30) { return Array.isArray(value) ? value.map((item) => cleanText(item, 1200)).filter(Boolean).slice(0, max) : []; }
function parseUrl(value: unknown) { const raw = cleanText(value, 1000); if (!raw) return { ok: true, value: null as string | null }; try { const parsed = new URL(raw); return { ok: parsed.protocol === "https:", value: parsed.protocol === "https:" ? raw : null }; } catch { return { ok: false, value: null as string | null }; } }
function parseImage(value: unknown) { const raw = cleanText(value, 1000); if (raw.startsWith("/") && !raw.includes("..") && raw.length > 1) return { ok: true, value: raw }; return parseUrl(raw); }
function state(value: string) { return value === "operational" || value === "in-development" ? value : "planned" as const; }
export async function PATCH(request: Request, context: Context) {
  const auth = await authorizeAdmin(request, ["admin", "editor"]); if (isResponse(auth)) return auth;
  const id = Number((await context.params).id); if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  try {
    const body = await request.json() as Record<string, unknown>;
    const titleFr = cleanText(body.titleFr, 220); const titleEn = cleanText(body.titleEn, 220); const slug = cleanText(body.slug, 180).toLowerCase();
    const shortDescriptionFr = cleanText(body.shortDescriptionFr, 1000); const shortDescriptionEn = cleanText(body.shortDescriptionEn, 1000);
    const descriptionFr = cleanText(body.descriptionFr, 5000); const descriptionEn = cleanText(body.descriptionEn, 5000); const status = cleanText(body.status, 40);
    if (titleFr.length < 2 || titleEn.length < 2 || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || shortDescriptionFr.length < 10 || shortDescriptionEn.length < 10 || descriptionFr.length < 10 || descriptionEn.length < 10 || !statuses.includes(status)) return Response.json({ error: "Vérifiez les titres, le slug, les descriptions et le statut." }, { status: 400 });
    const categoryId = Number(body.categoryId) || null;
    if (categoryId) { const [category] = await db.select({ id: projectCategories.id }).from(projectCategories).where(eq(projectCategories.id, categoryId)).limit(1); if (!category) return Response.json({ error: "Catégorie introuvable." }, { status: 400 }); }
    const objectivesFr = lines(body.objectivesFr, 30); const objectivesEn = lines(body.objectivesEn, 30);
    const featuresFr = lines(body.featuresFr, 60); const featuresEn = lines(body.featuresEn, 60); const states = lines(body.featureStates, 60);
    if (objectivesFr.length !== objectivesEn.length || featuresFr.length !== featuresEn.length || (states.length > 0 && states.length !== featuresFr.length)) return Response.json({ error: "Les contenus français et anglais doivent comporter le même nombre de lignes." }, { status: 400 });
    const demo = parseUrl(body.demoUrl); const repo = parseUrl(body.repositoryUrl); const image = parseImage(body.mainImageUrl);
    if (!demo.ok || !repo.ok || !image.ok) return Response.json({ error: "Les liens et images doivent utiliser une URL HTTPS valide." }, { status: 400 });
    const tech = lines(body.technologies, 40).map((item) => cleanText(item, 120));
    const [exists] = await db.select({ id: projects.id }).from(projects).where(eq(projects.id, id)).limit(1);
    if (!exists) return Response.json({ error: "Projet introuvable." }, { status: 404 });
    await db.update(projects).set({ categoryId, titleFr, titleEn, slug, shortDescriptionFr, shortDescriptionEn, descriptionFr, descriptionEn, status, role: cleanText(body.role, 1500), objectives: objectivesFr.map((fr, index) => ({ fr, en: objectivesEn[index] })), features: featuresFr.map((fr, index) => ({ fr, en: featuresEn[index], state: state(states[index] ?? "planned") })), technologies: tech, demoUrl: demo.value, repositoryUrl: repo.value, mainImageUrl: image.value, isPublished: body.isPublished === true, updatedAt: new Date() }).where(eq(projects.id, id));
    await logAdminAction(auth, "project.update", "project", String(id)); return Response.json({ ok: true });
  } catch { return Response.json({ error: "La modification n’a pas pu être enregistrée." }, { status: 500 }); }
}
export async function DELETE(request: Request, context: Context) {
  const auth = await authorizeAdmin(request, ["admin"]); if (isResponse(auth)) return auth;
  const id = Number((await context.params).id); if (!Number.isInteger(id) || id < 1) return Response.json({ error: "Identifiant invalide." }, { status: 400 });
  const [removed] = await db.delete(projects).where(eq(projects.id, id)).returning({ id: projects.id });
  if (!removed) return Response.json({ error: "Projet introuvable." }, { status: 404 });
  await logAdminAction(auth, "project.delete", "project", String(id)); return Response.json({ ok: true });
}
