"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { siteInfo } from "@/lib/site";
import { LanguageToggle, useLanguage } from "@/components/language-provider";
import { useMember } from "@/components/member-provider";
import { BrandLockup } from "@/components/brand";

/** Rubriques principales toujours visibles. */
const PRIMARY = [
  { href: "/", fr: "Accueil", en: "Home" },
  { href: "/about", fr: "À propos", en: "About" },
  { href: "/blog", fr: "Journal", en: "Journal" },
  { href: "/contact", fr: "Contact", en: "Contact" },
];

/** Rubriques regroupées dans « Explorer » (réservées aux membres). */
const EXPLORE = [
  { href: "/services", fr: "Services", en: "Services" },
  { href: "/portfolio", fr: "Réalisations", en: "Work" },
  { href: "/pricing", fr: "Tarifs", en: "Pricing" },
  { href: "/training", fr: "Formations", en: "Training" },
  { href: "/cahiers-des-charges", fr: "Cahiers des charges", en: "Specifications" },
  { href: "/presentation", fr: "Présentation", en: "Presentation" },
];

const MEMBER_ONLY_PATHS = ["/services", "/portfolio", "/pricing", "/training", "/cahiers-des-charges"];

function MemberChip() {
  const { member, loading, openModal } = useMember();
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
  return (
    <button type="button" className="member-icon-button" onClick={openModal} title={text("Se connecter / S'inscrire", "Sign in / Sign up")} aria-label={text("Se connecter / S'inscrire", "Sign in / Sign up")}>
      <UserRound size={18} />
    </button>
  );
}

export function SiteHeader({ siteLogo }: { siteLogo?: string | null }) {
  const pathname = usePathname();
  const { text } = useLanguage();
  const { member, openModal } = useMember();
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileExplore, setMobileExplore] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) setExploreOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setExploreOpen(false); setMenuOpen(false); }
    };
    document.addEventListener("click", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    setExploreOpen(false);
    setMenuOpen(false);
    setMobileExplore(false);
  }, [pathname]);

  if (pathname.startsWith("/admin") || pathname.startsWith("/presentation")) return null;

  const exploreLinks = member ? EXPLORE : EXPLORE.filter((item) => !MEMBER_ONLY_PATHS.includes(item.href));
  const exploreActive = exploreLinks.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  return (
    <header className="site-header">
      <div className="nav-wrap">
        <BrandLockup motto onClick={() => setMenuOpen(false)} src={siteLogo} />

        <nav className={`primary-nav${menuOpen ? " is-open" : ""}`} aria-label={text("Navigation principale", "Main navigation")}>
          {PRIMARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={pathname === item.href ? "nav-link is-current" : "nav-link"}
              onClick={() => setMenuOpen(false)}
            >
              {text(item.fr, item.en)}
            </Link>
          ))}

          {exploreLinks.length > 0 && (
            <div className={`nav-dropdown${exploreActive ? " is-active" : ""}`} ref={exploreRef}>
              <button
                type="button"
                className="nav-link nav-dropdown-trigger"
                aria-expanded={exploreOpen}
                aria-haspopup="true"
                onClick={() => setExploreOpen((open) => !open)}
              >
                {text("Explorer", "Explore")} <ChevronDown size={13} className={exploreOpen ? "is-rotated" : ""} />
              </button>
              {exploreOpen && (
                <div className="nav-dropdown-menu">
                  {exploreLinks.map((item) => (
                    <Link key={item.href} href={item.href} className={pathname === item.href ? "is-current" : ""} onClick={() => setExploreOpen(false)}>
                      <span>{text(item.fr, item.en)}</span>
                      <ArrowUpRight size={13} />
                    </Link>
                  ))}
                </div>
              )}
              <div className="nav-dropdown-mobile">
                <button type="button" className="nav-link nav-dropdown-trigger" aria-expanded={mobileExplore} onClick={() => setMobileExplore((open) => !open)}>
                  {text("Explorer", "Explore")} <ChevronDown size={14} className={mobileExplore ? "is-rotated" : ""} />
                </button>
                {mobileExplore && exploreLinks.map((item) => (
                  <Link key={item.href} href={item.href} className="nav-sublink" onClick={() => setMenuOpen(false)}>
                    {text(item.fr, item.en)}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {member ? (
            <Link href="/compte" className="nav-link" onClick={() => setMenuOpen(false)}>{text("Mon compte", "My account")}</Link>
          ) : (
            <button type="button" className="nav-link nav-link-button" onClick={() => { setMenuOpen(false); openModal(); }}>
              {text("Espace membre", "Member area")}
            </button>
          )}

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
      <div className="header-rail">
        <span>{text("Solutions numériques · Formation · Création", "Digital solutions · Learning · Creative")}</span>
        <span className="header-rail-contact"><a href={`mailto:${siteInfo.email}`}>{siteInfo.email}</a><span className="rail-dot" />{text("Disponible pour de nouveaux projets", "Open for new projects")}</span>
      </div>
    </header>
  );
}
