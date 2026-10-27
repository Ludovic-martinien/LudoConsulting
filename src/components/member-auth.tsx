"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, LogIn, LogOut, User, UserPlus, X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";

type Member = { id: number; name: string; email: string; phone: string | null; avatar: string | null };
type Mode = "login" | "signup";

export const AUTH_EVENT = "ludo:open-auth";

export function openAuth(mode: Mode = "login") {
  window.dispatchEvent(new CustomEvent(AUTH_EVENT, { detail: { mode } }));
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.7z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .8-2.4 1.2-4.1 1.2-3.2 0-5.9-2.1-6.8-5.1l-.1.1-3.6 2.8v.1C3.5 21.3 7.5 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.3c-.2-.7-.4-1.5-.4-2.3s.1-1.6.4-2.3l-.1-.1-3.5-2.7-.1.1C.5 8.9 0 10.4 0 12s.5 3.1 1.4 4.5l3.8-2.2z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.5 2.7 1.4 6.9l3.8 2.9c.9-2.9 3.6-5.1 6.8-5.1z" />
    </svg>
  );
}

export function AuthButtons() {
  const { text } = useLanguage();
  const [user, setUser] = useState<Member | null>(null);
  const [modal, setModal] = useState<{ open: boolean; mode: Mode }>({ open: false, mode: "login" });
  const [toast, setToast] = useState("");

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/user/me", { credentials: "same-origin" });
      const data = (await response.json()) as { user: Member | null };
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onOpen = (event: Event) => {
      const mode = (event as CustomEvent<{ mode?: Mode }>).detail?.mode;
      setModal({ open: true, mode: mode === "signup" ? "signup" : "login" });
    };
    window.addEventListener(AUTH_EVENT, onOpen);
    const params = new URLSearchParams(window.location.search);
    const authFlag = params.get("auth");
    const memberFlag = params.get("member");
    if (authFlag === "google-unavailable") {
      setModal({ open: true, mode: "login" });
      setToast(text("La connexion Google n'est pas encore configurée sur ce site.", "Google sign-in is not configured on this site yet."));
    } else if (authFlag === "cancelled") {
      setToast(text("Connexion Google annulée.", "Google sign-in cancelled."));
    } else if (authFlag === "error") {
      setModal({ open: true, mode: "login" });
      setToast(text("La connexion Google a échoué. Réessayez ou utilisez votre e-mail.", "Google sign-in failed. Try again or use your email."));
    } else if (memberFlag === "welcome") {
      refresh();
      setToast(text("Bienvenue ! Vous êtes connecté.", "Welcome! You are signed in."));
    }
    if (authFlag || memberFlag) {
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      url.searchParams.delete("member");
      window.history.replaceState(null, "", url.pathname + url.search);
    }
    return () => window.removeEventListener(AUTH_EVENT, onOpen);
  }, [refresh, text]);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(""), 6000);
    return () => clearTimeout(timer);
  }, [toast]);

  async function logout() {
    await fetch("/api/user/logout", { method: "POST", credentials: "same-origin" }).catch(() => undefined);
    setUser(null);
  }

  return (
    <>
      <div className="auth-buttons">
        {user ? (
          <span className="auth-user-chip" title={user.email}>
            {user.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar} alt="" width={26} height={26} referrerPolicy="no-referrer" />
            ) : (
              <span className="auth-avatar-fallback" aria-hidden="true">{user.name.trim().charAt(0).toUpperCase() || "•"}</span>
            )}
            <span className="auth-user-name">{user.name.split(" ")[0]}</span>
            <button type="button" className="auth-logout" onClick={logout} aria-label={text("Se déconnecter", "Sign out")} title={text("Se déconnecter", "Sign out")}>
              <LogOut size={15} />
            </button>
          </span>
        ) : (
          <button
            type="button"
            className="auth-icon-btn"
            onClick={() => setModal({ open: true, mode: "login" })}
            aria-label={text("Se connecter / S'inscrire", "Sign in / Sign up")}
            title={text("Se connecter / S'inscrire", "Sign in / Sign up")}
          >
            <User size={19} />
          </button>
        )}
      </div>
      {toast ? (
        <div className="auth-toast" role="status">{toast}</div>
      ) : null}
      <AuthModal
        open={modal.open}
        mode={modal.mode}
        onMode={setModal}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        onDone={() => {
          refresh();
          setModal((m) => ({ ...m, open: false }));
        }}
      />
    </>
  );
}

function PasswordField({
  label,
  value,
  onChange,
  autoComplete,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder: string;
}) {
  const [visible, setVisible] = useState(false);
  const { text } = useLanguage();
  return (
    <label>
      <span>{label}</span>
      <span className="auth-password-wrap">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          minLength={8}
          maxLength={256}
          autoComplete={autoComplete}
          placeholder={placeholder}
        />
        <button
          type="button"
          className="auth-eye"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? text("Masquer le mot de passe", "Hide password") : text("Afficher le mot de passe", "Show password")}
          title={visible ? text("Masquer le mot de passe", "Hide password") : text("Afficher le mot de passe", "Show password")}
        >
          {visible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </span>
    </label>
  );
}

function AuthModal({
  open,
  mode,
  onMode,
  onClose,
  onDone,
}: {
  open: boolean;
  mode: Mode;
  onMode: (m: { open: boolean; mode: Mode }) => void;
  onClose: () => void;
  onDone: () => void;
}) {
  const { text } = useLanguage();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [terms, setTerms] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [googleAvailable, setGoogleAvailable] = useState<boolean | null>(null);

  useEffect(() => {
    if (!open) return;
    setError("");
    setGoogleAvailable(null);
    fetch("/api/auth/providers", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d: { google?: boolean }) => setGoogleAvailable(d.google === true))
      .catch(() => setGoogleAvailable(false));
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function switchMode(next: Mode) {
    setError("");
    onMode({ open: true, mode: next });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (mode === "signup") {
      if (password !== confirm) {
        setError(text("Les deux mots de passe ne correspondent pas.", "Both passwords do not match."));
        return;
      }
      if (!terms) {
        setError(text("Veuillez accepter l'utilisation de vos données pour créer votre compte.", "Please accept the use of your data to create your account."));
        return;
      }
    }
    setBusy(true);
    setError("");
    try {
      const response = await fetch(mode === "signup" ? "/api/user/signup" : "/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name, email, phone, password, terms }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(data.error || text("Une erreur est survenue.", "Something went wrong."));
        setBusy(false);
        return;
      }
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setConfirm("");
      setTerms(false);
      setBusy(false);
      onDone();
    } catch {
      setError(text("Connexion impossible. Vérifiez votre réseau.", "Cannot connect. Check your network."));
      setBusy(false);
    }
  }

  return (
    <div className="auth-backdrop" onClick={onClose} role="presentation">
      <div className="auth-modal" role="dialog" aria-modal="true" aria-label={text("Espace membre", "Member area")} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-close" onClick={onClose} aria-label={text("Fermer", "Close")}>
          <X size={18} />
        </button>
        <div className="auth-modal-head">
          <span className="auth-modal-icon" aria-hidden="true">
            {mode === "signup" ? <UserPlus size={20} /> : <LogIn size={20} />}
          </span>
          <div>
            <h2>{mode === "signup" ? text("Créer un compte", "Create an account") : text("Bon retour !", "Welcome back!")}</h2>
            <p className="auth-sub">
              {mode === "signup"
                ? text("Rejoignez l'espace membre Ludo_Consulting.", "Join the Ludo_Consulting member area.")
                : text("Connectez-vous pour retrouver votre espace.", "Sign in to access your space.")}
            </p>
          </div>
        </div>

        <div className="auth-tabs" role="tablist">
          <button type="button" role="tab" aria-selected={mode === "login"} className={mode === "login" ? "is-active" : ""} onClick={() => switchMode("login")}>
            {text("Connexion", "Sign in")}
          </button>
          <button type="button" role="tab" aria-selected={mode === "signup"} className={mode === "signup" ? "is-active" : ""} onClick={() => switchMode("signup")}>
            {text("Inscription", "Sign up")}
          </button>
        </div>

        {googleAvailable === null ? (
          <div className="auth-google-loading">{text("Chargement…", "Loading…")}</div>
        ) : googleAvailable ? (
          <a className="auth-google-btn" href="/api/auth/google">
            <GoogleMark />
            {mode === "signup"
              ? text("S'inscrire avec Google", "Sign up with Google")
              : text("Continuer avec Google", "Continue with Google")}
          </a>
        ) : (
          <p className="auth-note">{text("Connexion Google bientôt disponible : utilisez votre e-mail pour le moment.", "Google sign-in coming soon — please use your email for now.")}</p>
        )}

        <div className="auth-divider"><span>{text("ou avec votre e-mail", "or with your email")}</span></div>

        <form onSubmit={submit} className="auth-form">
          {mode === "signup" ? (
            <>
              <p className="auth-section-title">{text("1 · Votre identité", "1 · Your identity")}</p>
              <label>
                <span>{text("Nom complet", "Full name")}</span>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={180} autoComplete="name" placeholder={text("Ex. : Aïcha Nguema", "E.g.: Aïcha Nguema")} />
              </label>
              <p className="auth-section-title">{text("2 · Vos coordonnées", "2 · Your contact details")}</p>
              <label>
                <span>{text("Adresse e-mail", "Email address")}</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} autoComplete="email" placeholder="vous@exemple.com" />
              </label>
              <label>
                <span>{text("Téléphone (facultatif)", "Phone (optional)")}</span>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={30} autoComplete="tel" placeholder="+241 …" />
              </label>
              <p className="auth-section-title">{text("3 · Sécurité du compte", "3 · Account security")}</p>
              <div className="auth-grid-2">
                <PasswordField label={text("Mot de passe", "Password")} value={password} onChange={setPassword} autoComplete="new-password" placeholder={text("8 caractères min.", "8 chars min.")} />
                <PasswordField label={text("Confirmer", "Confirm")} value={confirm} onChange={setConfirm} autoComplete="new-password" placeholder={text("Répétez-le", "Repeat it")} />
              </div>
              <label className="auth-check">
                <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} required />
                <span>{text("J'accepte que mes données soient utilisées pour gérer mon compte membre.", "I agree that my data will be used to manage my member account.")}</span>
              </label>
            </>
          ) : (
            <>
              <label>
                <span>{text("Adresse e-mail", "Email address")}</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required maxLength={254} autoComplete="email" placeholder="vous@exemple.com" />
              </label>
              <PasswordField label={text("Mot de passe", "Password")} value={password} onChange={setPassword} autoComplete="current-password" placeholder="••••••••" />
            </>
          )}
          {error ? (
            <p className="auth-error" role="alert">{error}</p>
          ) : null}
          <button type="submit" className="button button-primary auth-submit" disabled={busy}>
            {busy ? text("Veuillez patienter…", "Please wait…") : mode === "signup" ? text("Créer mon compte", "Create my account") : text("Se connecter", "Sign in")}
          </button>
        </form>
        <p className="auth-privacy">
          {text("Vos données restent confidentielles et ne sont jamais revendues.", "Your data stays private and is never sold.")}
        </p>
      </div>
    </div>
  );
}
