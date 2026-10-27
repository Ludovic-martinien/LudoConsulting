"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/components/language-provider";
import { useMember } from "@/components/member-provider";
import { MemberAuthForms } from "@/components/member-auth-forms";

export function MemberModal() {
  const { isModalOpen, closeModal, member } = useMember();
  const { text } = useLanguage();
  const router = useRouter();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isModalOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      dialogRef.current?.querySelector("input")?.focus();
    }, 80);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
    };
  }, [isModalOpen, closeModal]);

  if (!isModalOpen || member) return null;

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div
        ref={dialogRef}
        className="modal-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="member-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="modal-close" onClick={closeModal} aria-label={text("Fermer", "Close")}>
          <X size={19} />
        </button>
        <h2 id="member-modal-title">{text("Connexion / Inscription", "Sign in / Sign up")}</h2>
        <p className="modal-sub">{text("Connectez-vous avec Google ou utilisez votre adresse e-mail. Vos informations restent privées.", "Sign in with Google or use your email address. Your information stays private.")}</p>
        <div className="member-card modal-card">
          <MemberAuthForms
            onAuthenticated={() => {
              closeModal();
              router.push("/compte");
            }}
          />
        </div>
      </div>
    </div>
  );
}
