import { googleConfigured, googleRedirectUri, googleStateToken, publicBaseUrl } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const home = new URL(`${publicBaseUrl(request)}/`);
  if (!googleConfigured()) {
    home.searchParams.set("auth", "google-unavailable");
    return Response.redirect(home, 302);
  }
  const redirectUri = googleRedirectUri(request);
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID?.trim() || "",
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email profile",
    state: await googleStateToken(),
    access_type: "online",
    prompt: "select_account",
  });
  return Response.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`, 302);
}
