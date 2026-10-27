"use client";

import { useEffect, useState } from "react";
import { Loader2, Lock, LogIn, Mail, Trash2, User } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { openAuth } from "@/components/member-auth";
import { refreshMemberState, setMemberState, useMember } from "@/components/member-store";

type FullProfile = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  provider: string;
  hasPassword: boolean;
  createdAt: string;
};

async function api(path: string, init?: RequestInit) {
  const response = await fetch(path, { credentials: "same-origin", ...init });
  const data = (await response.json().catch(() => ({}))) as { error?: string; user?: FullProfile; ok?: boolean };
  if (!response.ok) throw new Error(data.error || "Request failed");
  return data;
}

export function ProfileClient() {
  const { text, locale } = useLanguage();
  const { user, loaded } = useMember();
  const [profile, setProfile] = useState<FullProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [infosMsg, setInfosMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [infosBusy, setInfosBusy] = useState(false);

  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [emailMsg, setEmailMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [emailBusy, setEmailBusy] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [nextConfirm, setNextConfirm] = useState("");
  const [pwMsg, setPwMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pwBusy, setPwBusy] = useState(false);

  const [deleteCheck, setDeleteCheck] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteMsg, setDeleteMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  useEffect(() => {
    refreshMemberState();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    if (!user) {
      setLoading(false);
      setProfile(null);
      return;
    }
    api("/api/user/profile")
      .then((data) => {
        if (data.user) {
          setProfile(data.user);
          setName(data.user.name);
          setPhone(data.user.phone || "");
        }
      })
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, [loaded, user]);

  if (!loaded || loading) {
    return (
      <main className="profile-wrap">
        <div className="profile-loading" role="status">
          <Loader2 size={26} className="spin" />
          <p>{text("Chargement de votre profil…", "Loading your profile…")}</p>
        </div>
      </main>
    );
  }

  if (!user || !profile) {
    return (
      <main className="profile-wrap">
        <div className="profile-locked">
          <span className="profile-locked-icon" aria-hidden="true"><LogIn size={26} /></span>
          <h1>{text("Connectez-vous pour voir votre profil", "Sign in to view your profile")}</h1>
          <p>{text("Votre page profil est personnelle : créez un compte ou connectez-vous pour gérer vos informations.", "Your profile page is personal: create an account or sign in to manage your information.")}</p>
          <button type="button" className="button button-primary" onClick={() => openAuth("login")}>
            {text("Se connecter / S'inscrire", "Sign in / Sign up")}
          </button>
        </div>
      </main>
    );
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString(locale === "en" ? "en-GB" : "fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  async function saveInfos(event: React.FormEvent) {
    event.preventDefault();
    setInfosBusy(true);
    setInfosMsg(null);
    try {
      const data = await api("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (data.user) {
        setProfile(data.user);
        refreshMemberState();
        setInfosMsg({ ok: true, text: text("Informations enregistrées.", "Information saved.") });
      }
    } catch (e) {
      setInfosMsg({ ok: false, text: e instanceof Error ? e.message : text("Échec de l'enregistrement.", "Save failed.") });
    } finally {
      setInfosBusy(false);
    }
  }

  async function changeEmail(event: React.FormEvent) {
    event.preventDefault();
    setEmailBusy(true);
    setEmailMsg(null);
    try {
      const data = await api("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, currentPassword: emailPassword }),
      });
      if (data.user) {
        setProfile(data.user);
        setNewEmail("");
        setEmailPassword("");
        refreshMemberState();
        setEmailMsg({ ok: true, text: text("Adresse e-mail mise à jour.", "Email address updated.") });
      }
    } catch (e) {
      setEmailMsg({ ok: false, text: e instanceof Error ? e.message : text("Échec de la modification.", "Update failed.") });
    } finally {
      setEmailBusy(false);
    }
  }

  async function changePassword(event: React.FormEvent) {
    event.preventDefault();
    if (!profile) return;
    const hadPassword = profile.hasPassword;
    if (nextPassword !== nextConfirm) {
      setPwMsg({ ok: false, text: text("Les deux mots de passe ne correspondent pas.", "Both passwords do not match.") });
      return;
    }
    setPwBusy(true);
    setPwMsg(null);
    try {
      await api("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword: nextPassword }),
      });
      setCurrentPassword("");
      setNextPassword("");
      setNextConfirm("");
      refreshMemberState();
      setPwMsg({ ok: true, text: profile.hasPassword ? text("Mot de passe modifié.", "Password changed.") : text("Mot de passe créé : vous pouvez désormais aussi vous connecter avec votre e-mail.", "Password created: you can now also sign in with your email.") });
      setProfile({ ...profile, hasPassword: true });
    } catch (e) {
      setPwMsg({ ok: false, text: e instanceof Error ? e.message : text("Échec de la modification.", "Update failed.") });
    } finally {
      setPwBusy(false);
    }
  }

  async function removeAccount() {
    setDeleteBusy(true);
    setDeleteMsg(null);
    try {
      await api("/api/user/account", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: deleteCheck, password: deletePassword }),
      });
      setMemberState({ user: null });
      window.location.href = "/";
    } catch (e) {
      setDeleteMsg({ ok: false, text: e instanceof Error ? e.message : text("Échec de la suppression.", "Deletion failed.") });
      setDeleteBusy(false);
    }
  }

  return (
    <main className="profile-wrap">
      <div className="profile-head-card">
        <span className="profile-avatar" aria-hidden="true">
          {profile.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={profile.avatar} alt="" width={64} height={64} referrerPolicy="no-referrer" />
          ) : (
            profile.name.trim().charAt(0).toUpperCase() || "•"
          )}
        </span>
        <div>
          <p className="eyebrow">{text("Mon profil", "My profile")}</p>
          <h1>{profile.name}</h1>
          <p className="profile-meta">
            {profile.email}
            <span className="profile-dot" aria-hidden="true" />
            {profile.provider === "google" ? text("Compte Google", "Google account") : text("Compte e-mail", "Email account")}
            <span className="profile-dot" aria-hidden="true" />
            {text("Membre depuis le", "Member since")} {memberSince}
          </p>
        </div>
      </div>

      <div className="profile-grid">
        <section className="profile-card">
          <h2><User size={17} /> {text("Mes informations", "My information")}</h2>
          <form onSubmit={saveInfos} className="auth-form">
            <label>
              <span>{text("Nom complet", "Full name")}</span>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={180} autoComplete="name" />
            </label>
            <label>
              <span>{text("Téléphone", "Phone")}</span>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} autoComplete="tel" placeholder="+241 …" />
            </label>
            {infosMsg ? <p className={infosMsg.ok ? "auth-success" : "auth-error"} role="status">{infosMsg.text}</p> : null}
            <button type="submit" className="button button-primary auth-submit" disabled={infosBusy}>
              {infosBusy ? text("Enregistrement…", "Saving…") : text("Enregistrer", "Save")}
            </button>
          </form>
        </section>

        <section className="profile-card">
          <h2><Mail size={17} /> {text("Adresse e-mail", "Email address")}</h2>
          <p className="profile-current">{text("E-mail actuel :", "Current email:")} <strong>{profile.email}</strong></p>
          <form onSubmit={changeEmail} className="auth-form">
            <label>
              <span>{text("Nouvel e-mail", "New email")}</span>
              <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required maxLength={254} autoComplete="email" placeholder="nouveau@exemple.com" />
            </label>
            {profile.hasPassword ? (
              <label>
                <span>{text("Mot de passe actuel (confirmation)", "Current password (confirmation)")}</span>
                <input type="password" value={emailPassword} onChange={(e) => setEmailPassword(e.target.value)} required maxLength={256} autoComplete="current-password" placeholder="••••••••" />
              </label>
            ) : null}
            {emailMsg ? <p className={emailMsg.ok ? "auth-success" : "auth-error"} role="status">{emailMsg.text}</p> : null}
            <button type="submit" className="button button-primary auth-submit" disabled={emailBusy}>
              {emailBusy ? text("Enregistrement…", "Saving…") : text("Changer d'e-mail", "Change email")}
            </button>
          </form>
        </section>

        <section className="profile-card">
          <h2><Lock size={17} /> {profile.hasPassword ? text("Mot de passe", "Password") : text("Créer un mot de passe", "Create a password")}</h2>
          {!profile.hasPassword ? (
            <p className="profile-hint">{text("Votre compte utilise Google. Définissez un mot de passe pour pouvoir aussi vous connecter avec votre e-mail.", "Your account uses Google. Set a password to also sign in with your email.")}</p>
          ) : null}
          <form onSubmit={changePassword} className="auth-form">
            {profile.hasPassword ? (
              <label>
                <span>{text("Mot de passe actuel", "Current password")}</span>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required maxLength={256} autoComplete="current-password" placeholder="••••••••" />
              </label>
            ) : null}
            <div className="auth-grid-2">
              <label>
                <span>{text("Nouveau (8 min.)", "New (8 min.)")}</span>
                <input type="password" value={nextPassword} onChange={(e) => setNextPassword(e.target.value)} required minLength={8} maxLength={256} autoComplete="new-password" placeholder="••••••••" />
              </label>
              <label>
                <span>{text("Confirmer", "Confirm")}</span>
                <input type="password" value={nextConfirm} onChange={(e) => setNextConfirm(e.target.value)} required minLength={8} maxLength={256} autoComplete="new-password" placeholder="••••••••" />
              </label>
            </div>
            {pwMsg ? <p className={pwMsg.ok ? "auth-success" : "auth-error"} role="status">{pwMsg.text}</p> : null}
            <button type="submit" className="button button-primary auth-submit" disabled={pwBusy}>
              {pwBusy ? text("Enregistrement…", "Saving…") : profile.hasPassword ? text("Modifier le mot de passe", "Change password") : text("Créer le mot de passe", "Create password")}
            </button>
          </form>
        </section>

        <section className="profile-card profile-danger">
          <h2><Trash2 size={17} /> {text("Supprimer mon compte", "Delete my account")}</h2>
          <p className="profile-hint">{text("Cette action est définitive : votre profil sera supprimé et vous serez déconnecté.", "This action is permanent: your profile will be deleted and you will be signed out.")}</p>
          {profile.hasPassword ? (
            <label className="auth-password-label">
              <span>{text("Mot de passe (confirmation)", "Password (confirmation)")}</span>
              <span className="auth-password-wrap">
                <input type="password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} maxLength={256} autoComplete="current-password" placeholder="••••••••" />
              </span>
            </label>
          ) : null}
          <label className="auth-check">
            <input type="checkbox" checked={deleteCheck} onChange={(e) => setDeleteCheck(e.target.checked)} />
            <span>{text("Je confirme vouloir supprimer définitivement mon compte.", "I confirm I want to permanently delete my account.")}</span>
          </label>
          {deleteMsg ? <p className={deleteMsg.ok ? "auth-success" : "auth-error"} role="status">{deleteMsg.text}</p> : null}
          <button type="button" className="button profile-delete-btn" disabled={deleteBusy || !deleteCheck} onClick={removeAccount}>
            {deleteBusy ? text("Suppression…", "Deleting…") : text("Supprimer définitivement", "Delete permanently")}
          </button>
        </section>
      </div>
    </main>
  );
}
