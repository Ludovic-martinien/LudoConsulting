import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { SiteShell } from "@/components/site-shell";
import { getPublishedSocialLinks } from "@/lib/social";
import { getSiteLogoUrl } from "@/lib/media-server";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ludoconsulting.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Ludo_Consulting — Innover · Développer · Réussir",
    template: "%s | Ludo_Consulting",
  },
  description: "Développement informatique, intelligence artificielle, formation, cybersécurité, création graphique et accompagnement digital au Gabon.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/brand/Ludo_Consulting.svg", type: "image/svg+xml" },
      { url: "/brand/Ludo_Consulting-192.png", sizes: "192x192", type: "image/png" },
      { url: "/brand/Ludo_Consulting-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/brand/Ludo_Consulting-180.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "Ludo_Consulting", statusBarStyle: "black-translucent" },
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

export const viewport: Viewport = {
  themeColor: "#0b483e",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [socials, siteLogo] = await Promise.all([getPublishedSocialLinks(), getSiteLogoUrl()]);
  return <html lang="fr" suppressHydrationWarning><body><SiteShell socials={socials} siteLogo={siteLogo}>{children}</SiteShell></body></html>;
}
