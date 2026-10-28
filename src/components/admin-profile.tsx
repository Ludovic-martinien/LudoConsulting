"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/components/admin-http";

type Profile = {
  id: number;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
};

const roleLabels: Record<string, string> = { admin: "Administrateur", editor: "Éditeur", sales: "Commercial" };

export function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [nameMsg, setNameMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [nameBusy, setNameBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [nextConfirm, setNextConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/profile")
      .then(async (r) => {
        if (!r.ok) throw new Error();
        const data = (await r.json()) as { user: Profile };
        setProfile(data.user);
        setName(data.user.name || "");
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <section className="admin-content">
        <div className="admin-title-row"><div><h1>Mon profil</h1><p>Chargement…</p></div></div>
        <div className="dash-skeleton dash-skeleton-table" aria-hidden="true" />
      </section>
    );
  }

  if (!profile) {
    return (
      <section className="admin-content">
        <div className="admin-alert error" role="alert">Le profil n'a pas pu être chargé.</div>
      </section>
    );
  }

  const initial = (profile.name || profile.email).trim().charAt(0).toUpperCase();

  async function saveName(event: React.FormEvent) {
    event.preventDefault();
    setNameBusy(true);
    setNameMsg(null);
    try {
      const response = await adminFetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string; user?: Profile };
      if (!response.ok) throw new Error(result.error || "Enregistrement impossible.");
      if (result.user) {
        const newName = result.user.name;
        setProfile((prev) => (prev ? { ...prev, name: newName } : prev));
      }
      window.dispatchEvent(new CustomEvent("ludo:admin-profile-changed"));
      setNameMsg({ ok: true, text: "Nom enregistré." });
    } catch (cause) {
      setNameMsg({ ok: false, text: cause instanceof Error ? cause.message : "Enregistrement impossible." });
    } finally {
      setNameBusy(false);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (nextPassword !== nextConfirm) {
      setPwMsg({ ok: false, text: "Les deux mots de passe ne correspondent pas." });
      return;
    }
    setPwBusy(true);
    setPwMsg(null);
    try {
      const response = await adminFetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword: nextPassword }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(result.error || "Modification impossible.");
      setCurrentPassword("");
      setNextPassword("");
      setNextConfirm("");
      setPwMsg({ ok: true, text: "Mot de passe modifié. Il sera exigé à la prochaine connexion." });
    } catch (cause) {
      setPwMsg({ ok: false, text: cause instanceof Error ? cause.message : "Modification impossible." });
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <section className="admin-content">
      <div className="admin-title-row"><div><h1>Mon profil</h1><p>Informations du compte connecté. Le rôle ne peut pas être modifié ici.</p></div></div>
      <div className="profile-head-card">
        <span className="profile-avatar" aria-hidden="true">{initial}</span>
        <div>
          <p className="eyebrow">Compte {roleLabels[profile.role] ?? profile.role}</p>
          <h1>{profile.name || profile.email.split("@")[0]}</h1>
          <p className="profile-meta">
            {profile.email}
            <span className="profile-dot" aria-hidden="true" />
            {profile.isActive ? "Actif" : "Désactivé"}
            <span className="profile-dot" aria-hidden="true" />
            Créé le {new Date(profile.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            <span className="profile-dot" aria-hidden="true" />
            Dernière connexion : {profile.lastLoginAt ? new Date(profile.lastLoginAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
          </p>
        </div>
      </div>
      <div className="profile-grid">
        <section className="profile-card">
          <h2>Informations personnelles</h2>
          <form onSubmit={saveName} className="auth-form">
            <label>
              <span>Nom affiché</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={180} autoComplete="name" />
            </label>
            {nameMsg ? <p className={nameMsg.ok ? "auth-success" : "auth-error"} role="status">{nameMsg.text}</p> : null}
            <button type="submit" className="button button-primary auth-submit" disabled={nameBusy}>
              {nameBusy ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </section>
        <section className="profile-card">
          <h2>Changer le mot de passe</h2>
          <form onSubmit={changePassword} className="auth-form">
            <label>
              <span>Mot de passe actuel</span>
              <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required maxLength={256} autoComplete="current-password" placeholder="••••••••" />
            </label>
            <div className="auth-grid-2">
              <label>
                <span>Nouveau (8 min.)</span>
                <input type="password" value={nextPassword} onChange={(e) => setNextPassword(e.target.value)} required minLength={8} maxLength={256} autoComplete="new-password" placeholder="••••••••" />
              </label>
              <label>
                <span>Confirmer</span>
                <input type="password" value={nextConfirm} onChange={(e) => setNextConfirm(e.target.value)} required minLength={8} maxLength={256} autoComplete="new-password" placeholder="••••••••" />
              </label>
            </div>
            {pwMsg ? <p className={pwMsg.ok ? "auth-success" : "auth-error"} role="status">{pwMsg.text}</p> : null}
            <button type="submit" className="button button-primary auth-submit" disabled={pwBusy}>
              {pwBusy ? "Enregistrement…" : "Modifier le mot de passe"}
            </button>
          </form>
        </section>
      </div>
    </section>
  );
}
