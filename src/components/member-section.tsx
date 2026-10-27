"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, LogOut } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useMember } from "@/components/member-provider";
import { MemberAuthForms } from "@/components/member-auth-forms";

export function MemberSection() {
  const { text } = useLanguage();
  const { member, loading, refresh } = useMember();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await fetch("/api/member/logout", { method: "POST" });
    } finally {
      await refresh();
      setBusy(false);
    }
  }

  return (
    <section className="section member-section" id="espace-membre">
      <div className="section-inner member-grid">
        <div className="member-copy">
          <span className="eyebrow">{text("Espace membre", "Member area")}</span>
          <h2 className="section-title">{text("Votre compte, en un clic.", "Your account, in one click.")}</h2>
          <p className="section-copy">{text("Créez votre compte avec votre adresse e-mail ou connectez-vous avec Google. Votre profil pré-remplit ensuite vos demandes de contact, de devis et d'inscription.", "Create an account with your email address or sign in with Google. Your profile then pre-fills your contact, quote and registration requests.")}</p>
          <ul className="member-points">
            <li>{text("Connexion sécurisée, sans mot de passe à retenir avec Google", "Secure sign-in — no password to remember with Google")}</li>
            <li>{text("Formulaires pré-remplis avec votre profil", "Forms pre-filled with your profile")}</li>
            <li>{text("Suppression de votre compte possible à tout moment", "Delete your account at any time")}</li>
          </ul>
        </div>
        <div className="member-card">
          {loading ? (
            <p className="form-disclaimer">{text("Chargement…", "Loading…")}</p>
          ) : member ? (
            <div className="member-welcome">
              <span className="member-avatar-large">{member.image ? <img src={member.image} alt="" /> : member.name.charAt(0).toUpperCase()}</span>
              <h3>{text("Bonjour", "Hello")} {member.name.split(" ")[0]} !</h3>
              <p>{member.email}</p>
              <div className="member-welcome-actions">
                <Link href="/compte" className="button button-primary button-small">{text("Mon compte", "My account")} <ArrowUpRight size={14} /></Link>
                <button type="button" className="button button-outline-dark button-small" onClick={logout} disabled={busy}><LogOut size={14} /> {text("Déconnexion", "Sign out")}</button>
              </div>
            </div>
          ) : (
            <MemberAuthForms onAuthenticated={() => router.push("/compte")} />
          )}
        </div>
      </div>
    </section>
  );
}
