import { googleConfigured, googleRedirectUri } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return Response.json({ google: googleConfigured(), callbackUrl: googleRedirectUri(request) });
}
