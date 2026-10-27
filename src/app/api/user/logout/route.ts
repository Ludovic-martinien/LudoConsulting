import { NextResponse } from "next/server";
import { MEMBER_COOKIE } from "@/lib/member-auth";
import { sameOrigin } from "@/lib/request-guard";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Requête refusée." }, { status: 403 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(MEMBER_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0, sameSite: "lax" });
  return response;
}
