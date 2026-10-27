import "server-only";
import { redirect } from "next/navigation";
import { getMemberSession } from "@/lib/member-auth";

/** Protège une page publique : seuls les membres connectés peuvent la voir. */
export async function requireMemberPage() {
  const session = await getMemberSession();
  if (!session) redirect("/#espace-membre");
  return session;
}
