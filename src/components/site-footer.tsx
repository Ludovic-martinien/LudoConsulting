"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { siteInfo, navigation } from "@/lib/site";
import { useLanguage } from "@/components/language-provider";
import { BrandLockup } from "@/components/brand";
import { SocialIcon } from "@/components/social-icons";

type SocialLink = { platform: string; label: string; url: string };

export function SiteFooter() {
  const pathname = usePathname();
  const { text } = useLanguage();
  const [socials, setSocials] = useState<SocialLink[]>([]);
  useEffect(() => {
    fetch("/api/social-links", { credentials: "same-origin" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: SocialLink[] } | null) => {
        if (data && Array.isArray(data.items)) setSocials(data.items);
      })
      .catch(() => undefined);
  }, []);
  if (pathname.startsWith("/admin") || pathname.startsWith("/presentation")) return null;
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <BrandLockup href="/" className="footer-brand-lockup" />
          <p>{text(siteInfo.motto.fr, siteInfo.motto.en)}</p>
          <span className="footer-slogan">{text(siteInfo.slogan.fr, siteInfo.slogan.en)}</span>
        </div>
        <div className="footer-links-col"><h3>{text("Explorer", "Explore")}</h3>{navigation.slice(1, 6).map((item) => <Link key={item.href} href={item.href}>{text(item.fr, item.en)}</Link>)}<Link href="/presentation">{text("Présentation des projets", "Project presentation")}</Link></div>
        <div className="footer-links-col"><h3>{text("Contact", "Contact")}</h3><a href={`mailto:${siteInfo.email}`}><Mail size={15} /> {siteInfo.email}</a>{siteInfo.phones.map((phone, index) => <a key={phone} href={`tel:${siteInfo.phoneLinks[index]}`}><Phone size={15} /> {phone}</a>)}<a href={siteInfo.whatsappCatalog} target="_blank" rel="noreferrer">{text("Catalogue WhatsApp", "WhatsApp catalogue")} <ArrowUpRight size={14} /></a></div>
        <div className="footer-links-col"><h3>{text("Suivez-nous", "Follow us")}</h3>{socials.map((social) => <a key={social.platform} href={social.url} target="_blank" rel="noreferrer" aria-label={social.label}><SocialIcon platform={social.platform} size={15} /> {social.label}</a>)}</div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Ludo_Consulting. {text("Tous droits réservés.", "All rights reserved.")}</span><div><Link href="/privacy">{text("Confidentialité", "Privacy")}</Link><Link href="/legal">{text("Mentions légales", "Legal notice")}</Link><Link href="/terms">{text("Conditions", "Terms")}</Link><Link href="/admin/login" className="footer-admin-link">{text("Espace admin", "Admin area")}</Link></div></div>
    </footer>
  );
}
