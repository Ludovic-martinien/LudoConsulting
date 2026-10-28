import { NextResponse } from "next/server";
import { destroyMemberSession, getMemberSession } from "@/lib/member-auth";
import { logEvent } from "@/lib/activity";
import { sameOrigin } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  try {
    const session = await getMemberSession().catch(() => null);
    await destroyMemberSession();
    if (session) await logEvent({ actor: session.user.email, actorType: "member", action: "member.logout", entityType: "member_user", entityId: String(session.user.id) });
  } catch {
    /* La déconnexion locale reste acquise même si la base est injoignable. */
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set("ludo_member_session", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}
