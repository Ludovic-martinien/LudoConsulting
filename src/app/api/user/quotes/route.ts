import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { quoteRequests, services, users } from "@/db/schema";
import { MEMBER_COOKIE, verifyMemberToken } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${MEMBER_COOKIE}=`))
    ?.slice(MEMBER_COOKIE.length + 1);
  const session = await verifyMemberToken(token ? decodeURIComponent(token) : undefined);
  if (!session) return Response.json({ error: "Non connecté." }, { status: 401 });
  const [user] = await db.select({ id: users.id, tokenVersion: users.tokenVersion }).from(users).where(eq(users.id, session.uid)).limit(1);
  if (!user || user.tokenVersion !== session.tv) return Response.json({ error: "Non connecté." }, { status: 401 });
  const rows = await db
    .select({
      id: quoteRequests.id,
      referenceNumber: quoteRequests.referenceNumber,
      serviceSlug: quoteRequests.serviceSlug,
      serviceTitleFr: services.titleFr,
      serviceTitleEn: services.titleEn,
      status: quoteRequests.status,
      budget: quoteRequests.budget,
      desiredDeadline: quoteRequests.desiredDeadline,
      createdAt: quoteRequests.createdAt,
    })
    .from(quoteRequests)
    .leftJoin(services, eq(quoteRequests.serviceId, services.id))
    .where(eq(quoteRequests.userId, user.id))
    .orderBy(desc(quoteRequests.createdAt))
    .limit(50);
  return Response.json({
    items: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
  });
}
