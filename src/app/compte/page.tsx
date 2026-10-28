import { redirect } from "next/navigation";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages, quoteRequests, registrations, servicePackages, services } from "@/db/schema";
import { PageHero } from "@/components/page-hero";
import { AccountClient } from "@/components/account-client";
import { getMemberSession, getRecentLogins } from "@/lib/member-auth";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Mon compte",
  description: "Espace personnel des membres de Ludo_Consulting.",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ bienvenue?: string }> };

export default async function ComptePage({ searchParams }: Props) {
  const session = await getMemberSession();
  if (!session) redirect("/#espace-membre");
  const query = await searchParams;
  const { user } = session;
  const email = user.email.toLowerCase();
  const [logins, messages, quotes, regs, serviceRows, packageRows] = await Promise.all([
    getRecentLogins(user.id),
    db.select({ id: contactMessages.id, subject: contactMessages.subject, status: contactMessages.status, createdAt: contactMessages.createdAt })
      .from(contactMessages).where(eq(contactMessages.email, email)).orderBy(desc(contactMessages.createdAt)).limit(20),
    db.select({ id: quoteRequests.id, referenceNumber: quoteRequests.referenceNumber, serviceSlug: quoteRequests.serviceSlug, status: quoteRequests.status, createdAt: quoteRequests.createdAt })
      .from(quoteRequests).where(eq(quoteRequests.email, email)).orderBy(desc(quoteRequests.createdAt)).limit(20),
    db.select({ id: registrations.id, packageId: registrations.packageId, status: registrations.status, createdAt: registrations.createdAt })
      .from(registrations).where(eq(registrations.email, email)).orderBy(desc(registrations.createdAt)).limit(20),
    db.select({ slug: services.slug, titleFr: services.titleFr, titleEn: services.titleEn }).from(services),
    db.select({ id: servicePackages.id, nameFr: servicePackages.nameFr, nameEn: servicePackages.nameEn }).from(servicePackages),
  ]);
  const serviceNames = new Map(serviceRows.map((item) => [item.slug, item]));
  const packageNames = new Map(packageRows.map((item) => [item.id, item]));
  return (
    <main>
      <PageHero
        eyebrowFr="Espace membre"
        eyebrowEn="Member area"
        titleFr="Mon compte"
        titleEn="My account"
        descriptionFr="Vos informations personnelles et le suivi de vos demandes, en un seul endroit."
        descriptionEn="Your personal information and request tracking, in one place."
      />
      <section className="page-content">
        <div style={{ maxWidth: 720, margin: "auto" }}>
          <AccountClient
            id={user.id}
            name={user.name}
            email={user.email}
            image={user.image}
            googleLinked={user.googleLinked}
            hasPassword={user.hasPassword}
            createdAt={user.createdAt.toISOString()}
            welcomed={query.bienvenue === "1"}
            logins={logins.map((item) => ({ method: item.method, createdAt: item.createdAt.toISOString() }))}
            quotes={quotes.map((item) => ({
              referenceNumber: item.referenceNumber,
              serviceFr: item.serviceSlug ? serviceNames.get(item.serviceSlug)?.titleFr ?? item.serviceSlug : "—",
              serviceEn: item.serviceSlug ? serviceNames.get(item.serviceSlug)?.titleEn ?? item.serviceSlug : "—",
              status: item.status,
              createdAt: item.createdAt.toISOString(),
            }))}
            messages={messages.map((item) => ({
              subject: item.subject,
              status: item.status,
              createdAt: item.createdAt.toISOString(),
            }))}
            trainings={regs.map((item) => ({
              planFr: item.packageId ? packageNames.get(item.packageId)?.nameFr ?? "—" : "—",
              planEn: item.packageId ? packageNames.get(item.packageId)?.nameEn ?? "—" : "—",
              status: item.status,
              createdAt: item.createdAt.toISOString(),
            }))}
          />
        </div>
      </section>
    </main>
  );
}
