import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyMemberToken } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const token = request.headers.get("cookie")?.split(";").map((c) => c.trim()).find((c) => c.startsWith("ludo_member_session="))?.slice("ludo_member_session=".length);
    const session = await verifyMemberToken(token ? decodeURIComponent(token) : undefined);
    if (!session) return Response.json({ user: null });
    const [user] = await db.select().from(users).where(eq(users.id, session.uid)).limit(1);
    if (!user || user.tokenVersion !== session.tv || user.isActive === false) return Response.json({ user: null });
    return Response.json({ user: { id: user.id, name: user.name, email: user.email, phone: user.phone, avatar: user.avatarUrl } });
  } catch {
    return Response.json({ user: null });
  }
}
