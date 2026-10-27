import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { memberSessions, memberUsers } from "@/db/schema";
import { getMemberSession } from "@/lib/member-auth";
import { sameOrigin } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function DELETE(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const session = await getMemberSession();
  if (!session) return Response.json({ error: "Authentification requise." }, { status: 401 });
  await db.delete(memberSessions).where(eq(memberSessions.userId, session.user.id));
  await db.delete(memberUsers).where(eq(memberUsers.id, session.user.id));
  const response = NextResponse.json({ ok: true });
  response.cookies.set("ludo_member_session", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
