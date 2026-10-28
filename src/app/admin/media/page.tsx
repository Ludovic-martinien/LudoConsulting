import { AdminShell } from "@/components/admin-shell";
import { AdminMedia } from "@/components/admin-media";
import { requireAdminPage } from "@/lib/admin-page";
import { getMediaVersions } from "@/lib/media-server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Photo et logos officiels", robots: { index: false, follow: false } };

export default async function AdminMediaPage() {
  const session = await requireAdminPage(["admin", "editor"]);
  const versions = await getMediaVersions();
  return <AdminShell email={session.email} role={session.role}><AdminMedia versions={[...versions].map(([kind, updatedAt]) => ({ kind, updatedAt }))} /></AdminShell>;
}
