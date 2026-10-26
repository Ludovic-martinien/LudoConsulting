import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, quoteRequests, registrations, servicePackages } from "@/db/schema";
import { AdminShell } from "@/components/admin-shell";
import { AdminInbox } from "@/components/admin-inbox";
import { requireAdminPage } from "@/lib/admin-page";

export const dynamic = "force-dynamic";
export const metadata = { title: "Demandes reçues", robots: { index: false, follow: false } };

export default async function InboxPage() {
  const session = await requireAdminPage(["admin", "sales"]);
  const [quotes, messages, registrationRows] = await Promise.all([
    db.select().from(quoteRequests).orderBy(desc(quoteRequests.createdAt)),
    db.select().from(contactMessages).orderBy(desc(contactMessages.createdAt)),
    db.select().from(registrations).orderBy(desc(registrations.createdAt)),
  ]);
  const packages = await db.select({ id: servicePackages.id, nameFr: servicePackages.nameFr }).from(servicePackages);
  const packageNames = new Map(packages.map((item) => [item.id, item.nameFr]));
  const quoteData = quotes.map((item) => ({
    id: item.id, referenceNumber: item.referenceNumber, name: item.name, email: item.email, phone: item.phone, company: item.company,
    serviceSlug: item.serviceSlug, description: item.description, budget: item.budget, desiredDeadline: item.desiredDeadline,
    status: item.status, internalNotes: item.internalNotes, createdAt: item.createdAt,
  }));
  const messageData = messages.map((item) => ({
    id: item.id, name: item.name, email: item.email, phone: item.phone, subject: item.subject, message: item.message,
    status: item.status, createdAt: item.createdAt,
  }));
  const registrationData = registrationRows.map((item) => ({
    id: item.id, name: item.name, email: item.email, phone: item.phone,
    packageName: item.packageId ? packageNames.get(item.packageId) ?? null : null,
    message: item.message, status: item.status, createdAt: item.createdAt,
  }));
  return <AdminShell email={session.email} role={session.role}><AdminInbox quotes={quoteData} messages={messageData} registrations={registrationData} /></AdminShell>;
}
