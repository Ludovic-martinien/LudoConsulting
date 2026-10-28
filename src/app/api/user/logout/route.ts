import { NextResponse } from "next/server";
import { MEMBER_COOKIE, verifyMemberToken } from "@/lib/member-auth";
import { sameOrigin } from "@/lib/request-guard";
import { clientIp, logEvent } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  try {
    const token = request.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim())
      .find((c) => c.startsWith(`${MEMBER_COOKIE}=`))
      ?.slice(MEMBER_COOKIE.length + 1);
    const session = await verifyMemberToken(token ? decodeURIComponent(token) : undefined);
    if (session) {
      await logEvent({ action: "member.logout", actorType: "member", actorEmail: session.email, actorId: session.uid, entityType: "user", entityId: session.uid, ip: clientIp(request) });
    }
  } catch {
    /* la déconnexion aboutit dans tous les cas */
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(MEMBER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "lax" });
  return response;
}
