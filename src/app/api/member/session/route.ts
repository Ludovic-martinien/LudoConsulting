import { getMemberSession } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const googleReady = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  try {
    const session = await getMemberSession();
    if (!session) return Response.json({ member: null, googleReady });
    const { user } = session;
    return Response.json({
      member: { id: user.id, name: user.name, email: user.email, image: user.image },
      googleReady,
    });
  } catch {
    return Response.json({ member: null, googleReady: false });
  }
}
