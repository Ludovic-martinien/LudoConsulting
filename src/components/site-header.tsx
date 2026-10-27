"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navigation, siteInfo } from "@/lib/site";
import { LanguageToggle, useLanguage } from "@/components/language-provider";
import { BrandLockup } from "@/components/brand";
import { AuthButtons } from "@/components/member-auth";
import { refreshMemberState, useMember } from "@/components/member-store";

const GATED_NAV = new Set(["/services", "/portfolio", "/pricing", "/training"]);

export function SiteHeader() {
  const pathname = usePathname();
  const { text } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, admin } = useMember();
  useEffect(() => {
    refreshMemberState();
  }, []);
  const fullAccess = Boolean(user || admin);
  const visibleNav = fullAccess ? navigation : navigation.filter((item) => !GATED_NAV.has(item.href));
  if (pathname.startsWith("/admin") || pathname.startsWith("/presentation")) return null;
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <BrandLockup motto onClick={() => setMenuOpen(false)} />
        <nav className={`primary-nav${menuOpen ? " is-open" : ""}`} aria-label={text("Navigation principale", "Main navigation")}>
          {visibleNav.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "nav-link is-current" : "nav-link"} onClick={() => setMenuOpen(false)}>
              {text(item.fr, item.en)}
            </Link>
          ))}
          <div className="mobile-nav-actions"><LanguageToggle /><AuthButtons modalOwner={false} /></div>
          <Link href="/quote" className="button button-primary nav-mobile-cta" onClick={() => setMenuOpen(false)}>
            {text("Parler d’un projet", "Discuss a project")} <ArrowUpRight size={16} />
          </Link>
        </nav>
        <div className="nav-actions">
          <LanguageToggle compact />
          <AuthButtons />
          <Link href="/quote" className="button button-primary nav-cta">
            {text("Parler d’un projet", "Discuss a project")} <ArrowUpRight size={16} />
          </Link>
        </div>
        <button className="mobile-menu-button" type="button" aria-label={menuOpen ? text("Fermer le menu", "Close menu") : text("Ouvrir le menu", "Open menu")} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={23} /> : <Menu size={23} />}
        </button>
      </div>
      <div className="header-rail"><span>{text("Solutions numériques · Formation · Création", "Digital solutions · Learning · Creative")}</span><span className="header-rail-contact"><a href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a><span className="rail-dot" />{text("Disponible pour de nouveaux projets", "Open for new projects")}</span></div>
    </header>
  );
}
