import { NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs } from "@/db/schema";
import { getAdminSession } from "@/lib/auth";
import { sameOrigin } from "@/lib/request-guard";

export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const session = await getAdminSession();
  if (session) {
    try { await db.insert(activityLogs).values({ adminEmail: session.email, action: "admin.logout", entityType: "admin_user", details: { role: session.role } }); } catch { /* Logout must still clear the cookie. */ }
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("ludo_admin_session", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return response;
}
