"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ArrowUpRight, BarChart3, Bell, Inbox, LayoutDashboard, LogOut, Menu,
  Search, ShieldCheck, Activity, UserRound, Users, X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { AdminRole } from "@/lib/auth";
import { BrandLockup } from "@/components/brand";

const links = [
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, roles: ["admin", "editor", "sales"] },
  { href: "/admin/members", label: "Utilisateurs", icon: Users, roles: ["admin"] },
  { href: "/admin/roles", label: "Rôles", icon: ShieldCheck, roles: ["admin"] },
  { href: "/admin/activity", label: "Activités", icon: Activity, roles: ["admin", "editor", "sales"] },
  { href: "/admin/stats", label: "Statistiques", icon: BarChart3, roles: ["admin", "editor", "sales"] },
  { href: "/admin/inbox", label: "Demandes", icon: Inbox, roles: ["admin", "sales"], badge: "notifications" },
  { href: "/admin/services", label: "Services & tarifs", icon: LayoutDashboard, roles: ["admin", "editor"] },
  { href: "/admin/media", label: "Photo & logos", icon: LayoutDashboard, roles: ["admin", "editor"] },
  { href: "/admin/projects", label: "Projets", icon: LayoutDashboard, roles: ["admin", "editor"] },
  { href: "/admin/articles", label: "Articles", icon: LayoutDashboard, roles: ["admin", "editor"] },
  { href: "/admin/profil", label: "Mon profil", icon: UserRound, roles: ["admin", "editor", "sales"] },
] as const;

type SearchResults = {
  members: { id: number; name: string; email: string }[];
  quotes: { id: number; referenceNumber: string; name: string }[];
  messages: { id: number; subject: string; name: string }[];
};

type NotificationItem = { kind: "quote" | "message" | "training"; id: number; label: string; sub: string; createdAt: string };

function useDebouncedValue(value: string, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export function AdminShell({ children, email, role }: { children: ReactNode; email: string; role: AdminRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [notifCount, setNotifCount] = useState(0);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);
  const [bellOpen, setBellOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const debouncedQuery = useDebouncedValue(query, 350);
  const searchBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/admin/profile", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { profile?: { name?: string | null } } | null) => {
        if (data?.profile?.name) setProfileName(data.profile.name);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/admin/stats?period=7d", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { notificationCount?: number; notifications?: NotificationItem[] } | null) => {
        if (!data) return;
        setNotifCount(data.notificationCount ?? 0);
        setNotifs(data.notifications ?? []);
      })
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    if (debouncedQuery.trim().length < 2) {
      setResults(null);
      setSearching(false);
      return;
    }
    setSearching(true);
    fetch(`/api/admin/search?q=${encodeURIComponent(debouncedQuery.trim())}`, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: SearchResults | null) => {
        setResults(data);
        setSearching(false);
        setSearchOpen(true);
      })
      .catch(() => setSearching(false));
  }, [debouncedQuery]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (searchBox.current && !searchBox.current.contains(event.target as Node)) setSearchOpen(false);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const logout = useCallback(async () => {
    if (!window.confirm("Se déconnecter de l'administration et revenir au site public ?")) return;
    setBusy(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/");
      router.refresh();
    }
  }, [router]);

  const visibleLinks = links.filter((link) => (link.roles as readonly string[]).includes(role));
  const initial = (profileName || email).charAt(0).toUpperCase();
  const hasResults = results && (results.members.length + results.quotes.length + results.messages.length > 0);

  const sidebar = (
    <>
      <div className="admin-side-brand"><BrandLockup href="/admin" /></div>
      <nav className="admin-side-nav" aria-label="Navigation de l'administration">
        {visibleLinks.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`));
          return (
            <Link key={link.href} href={link.href} className={active ? "is-current" : ""} onClick={() => setDrawer(false)}>
              <Icon size={17} />
              <span>{link.label}</span>
              {"badge" in link && notifCount > 0 && <em className="admin-nav-badge">{notifCount > 99 ? "99+" : notifCount}</em>}
            </Link>
          );
        })}
      </nav>
      <div className="admin-side-foot">
        <Link href="/" target="_blank"><ArrowUpRight size={14} /> Voir le site</Link>
        <button type="button" onClick={logout} disabled={busy}><LogOut size={14} /> Déconnexion</button>
      </div>
    </>
  );

  return (
    <div className="admin-shell-v2">
      <aside className={`admin-sidebar${drawer ? " is-open" : ""}`}>
        {sidebar}
        <button type="button" className="admin-drawer-close" onClick={() => setDrawer(false)} aria-label="Fermer le menu"><X size={19} /></button>
      </aside>
      {drawer && <div className="admin-drawer-veil" onClick={() => setDrawer(false)} />}
      <div className="admin-main">
        <header className="admin-topbar">
          <button type="button" className="admin-burger" onClick={() => setDrawer(true)} aria-label="Ouvrir le menu"><Menu size={20} /></button>
          <div className="admin-title"><strong>Tableau de bord administrateur</strong><span>Ludo_Consulting</span></div>
          <div className="admin-search" ref={searchBox}>
            <Search size={15} />
            <label className="hidden-field" htmlFor="admin-search">Rechercher un membre ou une demande</label>
            <input
              id="admin-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => hasResults && setSearchOpen(true)}
              placeholder="Rechercher…"
              autoComplete="off"
            />
            {searching && <span className="admin-search-hint">…</span>}
            {searchOpen && results && (
              <div className="admin-search-results">
                {!hasResults && <p className="form-disclaimer" style={{ margin: 0 }}>Aucun résultat.</p>}
                {(results.members.length > 0) && <><p className="admin-search-group">Membres</p>{results.members.map((item) => <Link key={`m-${item.id}`} href="/admin/members" onClick={() => setSearchOpen(false)}><strong>{item.name}</strong><small>{item.email}</small></Link>)}</>}
                {(results.quotes.length > 0) && <><p className="admin-search-group">Devis</p>{results.quotes.map((item) => <Link key={`q-${item.id}`} href="/admin/inbox" onClick={() => setSearchOpen(false)}><strong>{item.referenceNumber}</strong><small>{item.name}</small></Link>)}</>}
                {(results.messages.length > 0) && <><p className="admin-search-group">Messages</p>{results.messages.map((item) => <Link key={`c-${item.id}`} href="/admin/inbox" onClick={() => setSearchOpen(false)}><strong>{item.subject}</strong><small>{item.name}</small></Link>)}</>}
              </div>
            )}
          </div>
          <div className="admin-bell-wrap">
            <button type="button" className="admin-icon-button" onClick={() => { setBellOpen((open) => !open); setUserOpen(false); }} aria-label="Notifications">
              <Bell size={18} />
              {notifCount > 0 && <em className="admin-dot">{notifCount > 99 ? "99+" : notifCount}</em>}
            </button>
            {bellOpen && (
              <div className="admin-dropdown">
                <p className="admin-dropdown-title">Nouvelles demandes</p>
                {notifs.length === 0 && <p className="form-disclaimer" style={{ margin: 0 }}>Rien à traiter.</p>}
                {notifs.map((item) => (
                  <Link key={`${item.kind}-${item.id}`} href="/admin/inbox" onClick={() => setBellOpen(false)}>
                    <strong>{item.kind === "quote" ? "Devis" : item.kind === "message" ? "Message" : "Formation"} · {item.label}</strong>
                    <small>{item.sub} · {new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.createdAt))}</small>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div className="admin-bell-wrap">
            <button type="button" className="admin-user-button" onClick={() => { setUserOpen((open) => !open); setBellOpen(false); }} aria-label="Menu utilisateur">
              <span className="admin-avatar">{initial}</span>
              <span className="admin-user-meta"><strong>{profileName || email.split("@")[0]}</strong><small>{role}</small></span>
            </button>
            {userOpen && (
              <div className="admin-dropdown">
                <Link href="/admin/profil" onClick={() => setUserOpen(false)}><strong>Mon profil</strong><small>{email}</small></Link>
                <button type="button" onClick={() => { setUserOpen(false); void logout(); }} disabled={busy}><LogOut size={14} /> Déconnexion</button>
              </div>
            )}
          </div>
        </header>
        <div className="admin-content-wrap">{children}</div>
      </div>
    </div>
  );
}

export function AdminLoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget); try { const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error || "Connexion impossible."); router.push("/admin"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Connexion impossible."); } finally { setBusy(false); } }
  return <form onSubmit={submit}><div className="admin-form-field"><label htmlFor="admin-email">Adresse e-mail</label><input id="admin-email" type="email" name="email" required autoComplete="username" maxLength={254} /></div><div className="admin-form-field"><label htmlFor="admin-password">Mot de passe</label><input id="admin-password" type="password" name="password" required autoComplete="current-password" maxLength={256} /></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit" disabled={busy}>{busy ? "Vérification…" : "Se connecter"}</button><p className="form-disclaimer">Le compte est configuré avec les variables d'environnement du déploiement. Aucun mot de passe n'est stocké en clair dans la base.</p></form>;
}
