"use client";

import Link from "next/link";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { siteInfo, navigation } from "@/lib/site";
import { useLanguage } from "@/components/language-provider";
import { useMember } from "@/components/member-provider";
import { BrandLockup } from "@/components/brand";

const MEMBER_ONLY_PATHS = ["/services", "/portfolio", "/pricing", "/training"];

export function SiteFooter() {
  const pathname = usePathname();
  const { text } = useLanguage();
  const { member } = useMember();
  const visibleNav = navigation.slice(1, 6).filter((item) => member || !MEMBER_ONLY_PATHS.includes(item.href));
  if (pathname.startsWith("/admin") || pathname.startsWith("/presentation")) return null;
  return (
    <footer className="site-footer">
      <div className="footer-top">
        <div className="footer-brand">
          <BrandLockup href="/" className="footer-brand-lockup" />
          <p>{text(siteInfo.motto.fr, siteInfo.motto.en)}</p>
          <span className="footer-slogan">{text(siteInfo.slogan.fr, siteInfo.slogan.en)}</span>
        </div>
        <div className="footer-links-col"><h3>{text("Explorer", "Explore")}</h3>{visibleNav.map((item) => <Link key={item.href} href={item.href}>{text(item.fr, item.en)}</Link>)}<Link href="/presentation">{text("Présentation des projets", "Project presentation")}</Link></div>
        <div className="footer-links-col"><h3>{text("Contact", "Contact")}</h3><a href={`mailto:${siteInfo.email}`}><Mail size={15} /> {siteInfo.email}</a>{siteInfo.phones.map((phone, index) => <a key={phone} href={`tel:${siteInfo.phoneLinks[index]}`}><Phone size={15} /> {phone}</a>)}<a href={siteInfo.whatsappCatalog} target="_blank" rel="noreferrer">{text("Catalogue WhatsApp", "WhatsApp catalogue")} <ArrowUpRight size={14} /></a></div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} Ludo_Consulting. {text("Tous droits réservés.", "All rights reserved.")}</span><div><Link href="/privacy">{text("Confidentialité", "Privacy")}</Link><Link href="/legal">{text("Mentions légales", "Legal notice")}</Link><Link href="/terms">{text("Conditions", "Terms")}</Link><Link href="/admin/login" className="footer-admin-link">{text("Espace admin", "Admin area")}</Link></div></div>
    </footer>
  );
}
