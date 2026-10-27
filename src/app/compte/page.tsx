import { redirect } from "next/navigation";
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
  const logins = await getRecentLogins(user.id);
  return (
    <main>
      <PageHero
        eyebrowFr="Espace membre"
        eyebrowEn="Member area"
        titleFr="Mon compte"
        titleEn="My account"
        descriptionFr="Vos informations personnelles, en un seul endroit."
        descriptionEn="Your personal information, in one place."
      />
      <section className="page-content">
        <div style={{ maxWidth: 640, margin: "auto" }}>
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
          />
        </div>
      </section>
    </main>
  );
}
