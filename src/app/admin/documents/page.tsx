import { AdminShell } from "@/components/admin-shell";
import { AdminDocuments } from "@/components/admin-documents";
import { requireAdminPage } from "@/lib/admin-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cahiers des charges", robots: { index: false, follow: false } };

export default async function AdminDocumentsPage() {
  const session = await requireAdminPage(["admin", "editor"]);
  return <AdminShell email={session.email} role={session.role}><AdminDocuments /></AdminShell>;
}
