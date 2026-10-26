"use client";

import Link from "next/link";
import { useLanguage } from "@/components/language-provider";
export default function NotFound() {
  const { text } = useLanguage();
  return <main className="page-content" style={{ textAlign: "center", minHeight: "60vh", display: "grid", placeItems: "center" }}><div><span className="eyebrow">404 · {text("Page introuvable", "Page not found")}</span><h1 className="section-title" style={{ margin: "20px auto" }}>{text("Cette page n'existe pas (ou plus).", "This page doesn't exist (or is no longer available).")}</h1><p className="section-copy" style={{ margin: "0 auto 25px" }}>{text("Le lien a peut-être changé. Retournez à l'accueil ou découvrez les services de Ludo_Consulting.", "The link may have changed. Return home or explore Ludo_Consulting's services.")}</p><div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}><Link href="/" className="button button-primary">{text("Retour à l'accueil", "Return home")}</Link><Link href="/services" className="button button-outline-dark">{text("Voir les services", "View services")}</Link></div></div></main>;
}
