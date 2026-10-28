import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { registrations, servicePackages, users } from "@/db/schema";
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
      id: registrations.id,
      packageNameFr: servicePackages.nameFr,
      packageNameEn: servicePackages.nameEn,
      status: registrations.status,
      createdAt: registrations.createdAt,
    })
    .from(registrations)
    .leftJoin(servicePackages, eq(registrations.packageId, servicePackages.id))
    .where(eq(registrations.userId, user.id))
    .orderBy(desc(registrations.createdAt))
    .limit(50);
  return Response.json({
    items: rows.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
  });
}
