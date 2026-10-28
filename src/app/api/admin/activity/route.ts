import { and, desc, gte, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { authorizeAdmin, isResponse } from "@/lib/admin-api";
import { describeAction } from "@/lib/activity-labels";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const auth = await authorizeAdmin(request, ["admin"]);
  if (isResponse(auth)) return auth;
  const params = new URL(request.url).searchParams;
  const q = (params.get("q") || "").trim();
  const category = params.get("category") || "all";
  const action = params.get("action") || "all";
  const result = params.get("result") || "all";
  const from = params.get("from") || "";
  const to = params.get("to") || "";
  const page = Math.max(1, Number(params.get("page")) || 1);
  const perPage = Math.min(50, Math.max(5, Number(params.get("perPage")) || 15));

  const conditions = [];
  if (q) {
    const like = `%${q.replace(/[%_]/g, "")}%`;
    conditions.push(or(ilike(activityLogs.action, like), ilike(activityLogs.adminEmail, like), ilike(activityLogs.entityId, like)));
  }
  if (action !== "all") conditions.push(sql`${activityLogs.action} = ${action}`);
  if (result === "success") conditions.push(sql`${activityLogs.success} = true`);
  if (result === "failed") conditions.push(sql`${activityLogs.success} = false`);
  if (from) conditions.push(gte(activityLogs.createdAt, new Date(`${from}T00:00:00`)));
  if (to) {
    const end = new Date(`${to}T00:00:00`);
    end.setDate(end.getDate() + 1);
    conditions.push(lte(activityLogs.createdAt, end));
  }
  const where = conditions.length ? and(...conditions) : undefined;
  // La catégorie est dérivée du code d'action : on filtre en mémoire après lecture.
  const rows = await db
    .select()
    .from(activityLogs)
    .where(where)
    .orderBy(desc(activityLogs.createdAt))
    .limit(1000);
  const withCategory = rows.map((row) => ({ ...row, category: describeAction(row.action).category }));
  const filtered = category === "all" ? withCategory : withCategory.filter((r) => r.category === category);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const safePage = Math.min(page, totalPages);
  const actions = [...new Set(rows.map((r) => r.action))].sort();
  return Response.json({
    items: filtered.slice((safePage - 1) * perPage, safePage * perPage).map((r) => ({
      id: r.id,
      action: r.action,
      category: r.category,
      actorType: r.actorType,
      actorEmail: r.adminEmail,
      actorId: r.actorId,
      entityType: r.entityType,
      entityId: r.entityId,
      details: r.details,
      success: r.success,
      ip: r.ip,
      createdAt: r.createdAt.toISOString(),
    })),
    actions,
    total,
    page: safePage,
    perPage,
    totalPages,
  });
}
