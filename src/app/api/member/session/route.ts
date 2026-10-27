import { getMemberSession } from "@/lib/member-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getMemberSession();
    if (!session) return Response.json({ member: null });
    const { user } = session;
    return Response.json({ member: { id: user.id, name: user.name, email: user.email, image: user.image } });
  } catch {
    return Response.json({ member: null });
  }
}
