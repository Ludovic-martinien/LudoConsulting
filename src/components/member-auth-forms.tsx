"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, LoaderCircle, UserRound } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useMember } from "@/components/member-provider";

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.1 3.5 2.7.2.1c2.2-2 3.8-5 3.8-8.9z" />
      <path fill="#34A853" d="M12 24c3.2 0 6-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.1.1-3.6 2.8v.1C3.5 21.5 7.5 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4v-.1L1.6 6.6l-.1.1C.6 8.4 0 10.1 0 12s.6 3.6 1.5 5.3l3.7-2.9z" />
      <path fill="#EA4335" d="M12 4.6c1.8 0 3 .8 3.7 1.4l3.2-3.1C17 1.1 14.8 0 12 0 7.5 0 3.5 2.5 1.5 6.6l3.7 2.9c1-2.9 3.7-4.9 6.8-4.9z" />
    </svg>
  );
}

function TrapField() {
  return <div className="hidden-field" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off" /></label></div>;
}

export function MemberAuthForms({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { text } = useLanguage();
  const { googleReady, refresh } = useMember();
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("erreur") === "google") {
      setError(text("La connexion avec Google n'a pas abouti. Vérifiez que le service est configuré, puis réessayez.", "Google sign-in did not complete. Check that the service is configured, then try again."));
      window.history.replaceState(null, "", "/#espace-membre");
    }
  }, [text]);

  async function submit(event: FormEvent<HTMLFormElement>, mode: "login" | "register") {
    event.preventDefault();
    setError("");
    setBusy(true);
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = { ...Object.fromEntries(data.entries()), consent: data.get("consent") === "on" };
    try {
      const response = await fetch(`/api/member/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { error?: string; redirect?: string };
      if (!response.ok) throw new Error(result.error || text("Une erreur est survenue.", "Something went wrong."));
      if (result.redirect) {
        router.push(result.redirect);
        return;
      }
      await refresh();
      onAuthenticated();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : text("Une erreur est survenue.", "Something went wrong."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {googleReady ? (
        <a href="/api/member/google" className="button google-button" onClick={() => setGoogleBusy(true)}>
          {googleBusy ? <LoaderCircle size={17} className="spin-icon" /> : <GoogleMark />}
          {text("Continuer avec Google", "Continue with Google")}
        </a>
      ) : (
        <div className="google-pending" role="note">
          <GoogleMark />
          <p>{text("La connexion avec Google sera activée dès que les identifiants Google seront configurés. En attendant, créez votre compte avec votre adresse e-mail.", "Google sign-in will be enabled once Google credentials are configured. In the meantime, create an account with your email address.")}</p>
        </div>
      )}
      <div className="member-divider"><span>{text("ou", "or")}</span></div>
      <div className="member-tabs" role="tablist" aria-label={text("Connexion ou inscription", "Sign in or sign up")}>
        <button type="button" role="tab" aria-selected={tab === "login"} className={tab === "login" ? "is-active" : ""} onClick={() => { setTab("login"); setError(""); }}>{text("Connexion", "Sign in")}</button>
        <button type="button" role="tab" aria-selected={tab === "register"} className={tab === "register" ? "is-active" : ""} onClick={() => { setTab("register"); setError(""); }}>{text("Inscription", "Sign up")}</button>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {tab === "login" ? (
        <form onSubmit={(event) => submit(event, "login")}>
          <div className="form-field"><span>{text("Adresse e-mail *", "Email address *")}</span><input type="email" name="email" required autoComplete="email" maxLength={254} /></div>
          <div className="form-field"><span>{text("Mot de passe *", "Password *")}</span><input type="password" name="password" required autoComplete="current-password" maxLength={256} /></div>
          <TrapField />
          <button type="submit" className="button button-primary member-submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="spin-icon" /> : <><UserRound size={15} /> {text("Se connecter", "Sign in")}</>}</button>
        </form>
      ) : (
        <form onSubmit={(event) => submit(event, "register")}>
          <div className="form-field"><span>{text("Nom et prénom *", "Full name *")}</span><input name="name" required autoComplete="name" minLength={2} maxLength={180} /></div>
          <div className="form-field"><span>{text("Adresse e-mail *", "Email address *")}</span><input type="email" name="email" required autoComplete="email" maxLength={254} /></div>
          <div className="form-field"><span>{text("Mot de passe * (10 caractères minimum)", "Password * (10 characters minimum)")}</span><input type="password" name="password" required autoComplete="new-password" minLength={10} maxLength={256} /></div>
          <TrapField />
          <label className="consent-check"><input type="checkbox" name="consent" required /><span>{text("J'accepte la création de mon compte et le traitement de mes données. Consultez la", "I agree to the creation of my account and the processing of my data. Read the")} <Link href="/privacy" className="text-link">{text("politique de confidentialité", "privacy policy")}</Link>.</span></label>
          <button type="submit" className="button button-primary member-submit" disabled={busy}>{busy ? <LoaderCircle size={16} className="spin-icon" /> : <>{text("Créer mon compte", "Create my account")} <ArrowUpRight size={15} /></>}</button>
          <p className="form-disclaimer">{text("Aucun e-mail de vérification n'est envoyé tant qu'un service de messagerie n'est pas configuré.", "No verification email is sent until a messaging service is configured.")}</p>
        </form>
      )}
    </>
  );
}
