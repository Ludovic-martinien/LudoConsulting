import { AdminShell } from "@/components/admin-shell";
import { AdminProfile } from "@/components/admin-profile";
import { requireAdminPage } from "@/lib/admin-page";
export const dynamic = "force-dynamic";
export const metadata = { title: "Mon profil", robots: { index: false, follow: false } };
export default async function AdminProfilePage() {
  const session = await requireAdminPage();
  return <AdminShell email={session.email} role={session.role}><AdminProfile /></AdminShell>;
}
