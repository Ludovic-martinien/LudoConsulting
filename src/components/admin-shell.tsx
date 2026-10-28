"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight, BarChart3, Bell, Briefcase, FileText, Folder, Image, Inbox, LayoutDashboard,
  LogOut, Menu, ScrollText, Search, ShieldCheck, UserCircle, Users, X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AdminRole } from "@/lib/auth";
import { BrandLockup } from "@/components/brand";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, roles: ["admin", "editor", "sales"] },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, roles: ["admin"] },
  { href: "/admin/roles", label: "Rôles", icon: ShieldCheck, roles: ["admin"] },
  { href: "/admin/activites", label: "Activités", icon: ScrollText, roles: ["admin"] },
  { href: "/admin/statistiques", label: "Statistiques", icon: BarChart3, roles: ["admin"] },
  { href: "/admin/inbox", label: "Demandes reçues", icon: Inbox, roles: ["admin", "sales"] },
  { href: "/admin/services", label: "Services & tarifs", icon: Briefcase, roles: ["admin", "editor"] },
  { href: "/admin/projects", label: "Projets", icon: Folder, roles: ["admin", "editor"] },
  { href: "/admin/articles", label: "Articles", icon: FileText, roles: ["admin", "editor"] },
  { href: "/admin/media", label: "Photo & logos", icon: Image, roles: ["admin", "editor"] },
  { href: "/admin/profil", label: "Mon profil", icon: UserCircle, roles: ["admin", "editor", "sales"] },
] as const;

const roleLabels: Record<AdminRole, string> = { admin: "Administrateur", editor: "Éditeur", sales: "Commercial" };

type NotifItem = { kind: string; id: number; label: string; date: string };

export function AdminShell({ children, email, role }: { children: ReactNode; email: string; role: AdminRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [notifs, setNotifs] = useState<{ totalNew: number; items: NotifItem[] }>({ totalNew: 0, items: [] });
  const [query, setQuery] = useState("");
  const menuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/profile", { credentials: "same-origin" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { user?: { name?: string | null } } | null) => setDisplayName(d?.user?.name || ""))
      .catch(() => undefined);
    const onProfile = () => {
      fetch("/api/admin/profile", { credentials: "same-origin" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { user?: { name?: string | null } } | null) => setDisplayName(d?.user?.name || ""))
        .catch(() => undefined);
    };
    window.addEventListener("ludo:admin-profile-changed", onProfile);
    return () => window.removeEventListener("ludo:admin-profile-changed", onProfile);
  }, []);

  useEffect(() => {
    let alive = true;
    const load = () => {
      fetch("/api/admin/stats?period=7d", { credentials: "same-origin" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d: { notifications?: { totalNew: number; items: NotifItem[] } } | null) => {
          if (alive && d?.notifications) setNotifs(d.notifications);
        })
        .catch(() => undefined);
    };
    load();
    const timer = setInterval(load, 120000);
    return () => { alive = false; clearInterval(timer); };
  }, []);

  useEffect(() => {
    setNavOpen(false);
    setMenuOpen(false);
    setNotifOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) window.location.reload();
    };
    window.addEventListener("pageshow", onPageShow);
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setMenuOpen(false);
      if (notifRef.current && !notifRef.current.contains(target)) setNotifOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    } finally {
      window.location.href = "/";
    }
  }

  function search(event: React.FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    router.push(`/admin/utilisateurs?q=${encodeURIComponent(query.trim())}`);
  }

  const initial = (displayName || email).trim().charAt(0).toUpperCase() || "A";
  const visibleLinks = links.filter((link) => (link.roles as readonly string[]).includes(role));

  return (
    <div className="dash-shell">
      <aside className={`dash-side${navOpen ? " is-open" : ""}`} aria-label="Navigation de l'administration">
        <div className="dash-side-head">
          <BrandLockup href="/admin" />
          <button type="button" className="dash-icon-btn dash-only-mobile" onClick={() => setNavOpen(false)} aria-label="Fermer le menu"><X size={18} /></button>
        </div>
        <nav className="dash-nav">
          {visibleLinks.map((link) => {
            const Icon = link.icon;
            const current = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
            return (
              <Link key={link.href} href={link.href} className={current ? "is-current" : ""} onClick={() => setNavOpen(false)}>
                <Icon size={17} /><span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="dash-side-foot">
          <Link href="/" target="_blank" className="dash-side-link">Voir le site <ArrowUpRight size={13} /></Link>
          <button type="button" className="dash-side-link dash-logout" onClick={logout} disabled={busy}>
            <LogOut size={15} /> {busy ? "…" : "Déconnexion"}
          </button>
        </div>
      </aside>
      {navOpen ? <div className="dash-backdrop" role="presentation" onClick={() => setNavOpen(false)} /> : null}

      <div className="dash-main">
        <header className="dash-topbar">
          <button type="button" className="dash-icon-btn dash-only-mobile" onClick={() => setNavOpen(true)} aria-label="Ouvrir le menu"><Menu size={19} /></button>
          <p className="dash-title">Tableau de bord <span>administrateur</span></p>
          {role === "admin" ? (
            <form className="dash-search" role="search" onSubmit={search}>
              <Search size={15} aria-hidden="true" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un utilisateur…" aria-label="Rechercher un utilisateur" maxLength={120} />
            </form>
          ) : <span className="dash-spacer" />}
          <div className="dash-top-actions">
            <div className="dash-drop-wrap" ref={notifRef}>
              <button type="button" className="dash-icon-btn dash-bell" onClick={() => { setNotifOpen((v) => !v); setMenuOpen(false); }} aria-label="Notifications" aria-expanded={notifOpen}>
                <Bell size={18} />
                {notifs.totalNew > 0 ? <span className="dash-badge">{notifs.totalNew > 9 ? "9+" : notifs.totalNew}</span> : null}
              </button>
              {notifOpen ? (
                <div className="dash-drop dash-notifs" role="menu">
                  <p className="dash-drop-title">À traiter ({notifs.totalNew})</p>
                  {notifs.items.length === 0 ? (
                    <p className="dash-drop-empty">Aucune demande en attente.</p>
                  ) : (
                    <ul>
                      {notifs.items.map((item) => (
                        <li key={`${item.kind}-${item.id}`}>
                          <Link href="/admin/inbox" onClick={() => setNotifOpen(false)}>
                            <strong>{item.label}</strong>
                            <small>{new Date(item.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                  <Link href="/admin/inbox" className="dash-drop-foot" onClick={() => setNotifOpen(false)}>Ouvrir les demandes</Link>
                </div>
              ) : null}
            </div>
            <div className="dash-drop-wrap" ref={menuRef}>
              <button type="button" className="dash-user" onClick={() => { setMenuOpen((v) => !v); setNotifOpen(false); }} aria-expanded={menuOpen} aria-label="Menu du compte">
                <span className="dash-avatar" aria-hidden="true">{initial}</span>
                <span className="dash-user-meta"><strong>{displayName || email.split("@")[0]}</strong><small>{roleLabels[role]}</small></span>
              </button>
              {menuOpen ? (
                <div className="dash-drop" role="menu">
                  <Link href="/admin/profil" onClick={() => setMenuOpen(false)}>Mon profil</Link>
                  <Link href="/" target="_blank">Voir le site</Link>
                  <button type="button" onClick={logout} disabled={busy}><LogOut size={14} /> {busy ? "…" : "Déconnexion"}</button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <div className="dash-body">{children}</div>
      </div>
    </div>
  );
}

export function AdminLoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget); try { const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error || "Connexion impossible."); router.push("/admin"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Connexion impossible."); } finally { setBusy(false); } }
  return <form onSubmit={submit}><div className="admin-form-field"><label htmlFor="admin-email">Adresse e-mail</label><input id="admin-email" type="email" name="email" required autoComplete="username" maxLength={254} /></div><div className="admin-form-field"><label htmlFor="admin-password">Mot de passe</label><input id="admin-password" type="password" name="password" required autoComplete="current-password" maxLength={256} /></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit" disabled={busy}>{busy ? "Vérification…" : "Se connecter"}</button><p className="form-disclaimer">Le compte est configuré avec les variables d'environnement du déploiement. Aucun mot de passe n'est stocké en clair dans la base.</p></form>;
}
