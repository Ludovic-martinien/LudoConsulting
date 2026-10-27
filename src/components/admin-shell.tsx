"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowUpRight, LogOut } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { AdminRole } from "@/lib/auth";
import { BrandLockup } from "@/components/brand";

const links = [
  { href: "/admin", label: "Vue d'ensemble", roles: ["admin", "editor", "sales"] },
  { href: "/admin/services", label: "Services & tarifs", roles: ["admin", "editor"] },
  { href: "/admin/media", label: "Photo & logos", roles: ["admin", "editor"] },
  { href: "/admin/projects", label: "Projets", roles: ["admin", "editor"] },
  { href: "/admin/articles", label: "Articles", roles: ["admin", "editor"] },
  { href: "/admin/inbox", label: "Demandes reçues", roles: ["admin", "sales"] },
  { href: "/admin/members", label: "Membres", roles: ["admin"] },
] as const;

export function AdminShell({ children, email, role }: { children: ReactNode; email: string; role: AdminRole }) {
  const pathname = usePathname(); const router = useRouter(); const [busy, setBusy] = useState(false);
  async function logout() { setBusy(true); try { await fetch("/api/auth/logout", { method: "POST" }); } finally { router.push("/admin/login"); router.refresh(); } }
  return <main className="admin-page"><div className="admin-shell"><header className="admin-topbar"><div className="admin-brand"><BrandLockup href="/admin" /><div><strong>Administration</strong><span>{email} · {role}</span></div></div><button className="button button-outline-dark button-small" type="button" onClick={logout} disabled={busy}>{busy ? "…" : <><LogOut size={14} /> Déconnexion</>}</button></header><nav className="admin-nav" aria-label="Navigation de l'administration">{links.filter((link) => (link.roles as readonly string[]).includes(role)).map((link) => <Link key={link.href} href={link.href} className={pathname === link.href || (link.href !== "/admin" && pathname.startsWith(`${link.href}/`)) ? "is-current" : ""}>{link.label}</Link>)}<Link href="/" target="_blank">Voir le site <ArrowUpRight size={12} style={{ display: "inline" }} /></Link></nav><div style={{ marginTop: 20 }}>{children}</div></div></main>;
}

export function AdminLoginForm() {
  const router = useRouter(); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const data = new FormData(event.currentTarget); try { const response = await fetch("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error || "Connexion impossible."); router.push("/admin"); router.refresh(); } catch (cause) { setError(cause instanceof Error ? cause.message : "Connexion impossible."); } finally { setBusy(false); } }
  return <form onSubmit={submit}><div className="admin-form-field"><label htmlFor="admin-email">Adresse e-mail</label><input id="admin-email" type="email" name="email" required autoComplete="username" maxLength={254} /></div><div className="admin-form-field"><label htmlFor="admin-password">Mot de passe</label><input id="admin-password" type="password" name="password" required autoComplete="current-password" maxLength={256} /></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary" type="submit" disabled={busy}>{busy ? "Vérification…" : "Se connecter"}</button><p className="form-disclaimer">Le compte est configuré avec les variables d'environnement du déploiement. Aucun mot de passe n'est stocké en clair dans la base.</p></form>;
}
