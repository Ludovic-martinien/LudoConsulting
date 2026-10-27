import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { getOrigin, googleAuthUrl, googleOAuthConfig, isSecureRequest, oauthStateCookieOptions } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const origin = getOrigin(request);
  const config = googleOAuthConfig(origin);
  if (!config) {
    return NextResponse.redirect(`${origin ?? "/"}/#espace-membre`);
  }
  const state = randomBytes(32).toString("base64url");
  const response = NextResponse.redirect(googleAuthUrl(config, state));
  response.cookies.set("ludo_oauth_state", state, oauthStateCookieOptions(isSecureRequest(request)));
  return response;
}
