"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { navigation, siteInfo } from "@/lib/site";
import { LanguageToggle, useLanguage } from "@/components/language-provider";
import { useMember } from "@/components/member-provider";
import { BrandLockup } from "@/components/brand";

function MemberChip() {
  const { member, loading } = useMember();
  const { text } = useLanguage();
  if (loading) return <span className="member-chip is-loading" aria-hidden="true" />;
  if (member) {
    return (
      <Link href="/compte" className="member-chip" aria-label={text("Mon compte", "My account")}>
        {member.image ? <img src={member.image} alt="" /> : <span className="member-avatar">{member.name.charAt(0).toUpperCase()}</span>}
        <span className="member-name">{member.name.split(" ")[0]}</span>
      </Link>
    );
  }
  return <Link href="/#espace-membre" className="member-login">{text("Se connecter", "Sign in")}</Link>;
}

export function SiteHeader() {
  const pathname = usePathname();
  const { text } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  if (pathname.startsWith("/admin") || pathname.startsWith("/presentation")) return null;
  return (
    <header className="site-header">
      <div className="nav-wrap">
        <BrandLockup motto onClick={() => setMenuOpen(false)} />
        <nav className={`primary-nav${menuOpen ? " is-open" : ""}`} aria-label={text("Navigation principale", "Main navigation")}>
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "nav-link is-current" : "nav-link"} onClick={() => setMenuOpen(false)}>
              {text(item.fr, item.en)}
            </Link>
          ))}
          <Link href="/#espace-membre" className="nav-link" onClick={() => setMenuOpen(false)}>{text("Espace membre", "Member area")}</Link>
          <div className="mobile-nav-actions"><LanguageToggle /></div>
          <Link href="/quote" className="button button-primary nav-mobile-cta" onClick={() => setMenuOpen(false)}>
            {text("Parler d’un projet", "Discuss a project")} <ArrowUpRight size={16} />
          </Link>
        </nav>
        <div className="nav-actions">
          <MemberChip />
          <LanguageToggle compact />
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
