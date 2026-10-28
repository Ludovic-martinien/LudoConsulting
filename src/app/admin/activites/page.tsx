import { AdminShell } from "@/components/admin-shell";
import { AdminActivity } from "@/components/admin-activity";
import { requireAdminPage } from "@/lib/admin-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Activités", robots: { index: false, follow: false } };
export default async function AdminActivityPage() {
  const session = await requireAdminPage(["admin"]);
  return <AdminShell email={session.email} role={session.role}><AdminActivity /></AdminShell>;
}
