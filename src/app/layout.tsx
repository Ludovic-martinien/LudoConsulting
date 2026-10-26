import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://ludoconsulting.vercel.app"),
  title: {
    default: "Ludo_Consulting — Innover · Développer · Réussir",
    template: "%s | Ludo_Consulting",
  },
  description: "Développement informatique, intelligence artificielle, formation, cybersécurité, création graphique et accompagnement digital au Gabon.",
  icons: { icon: [{ url: "/brand/ludo-mark.svg", type: "image/svg+xml" }, { url: "/icon.svg", type: "image/svg+xml" }], apple: "/brand/ludo-mark.svg" },
  openGraph: {
    title: "Ludo_Consulting — Innover · Développer · Réussir",
    description: "Votre partenaire pour vos projets numériques, votre formation et votre réussite professionnelle.",
    url: "https://ludoconsulting.vercel.app",
    siteName: "Ludo_Consulting",
    locale: "fr_GA",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="fr" suppressHydrationWarning><body><SiteShell>{children}</SiteShell></body></html>;
}
