export type ActivityCategory = "auth" | "accounts" | "content" | "requests" | "admin" | "system";

export const ACTIVITY_CATEGORIES: { id: ActivityCategory; fr: string; en: string }[] = [
  { id: "auth", fr: "Connexions", en: "Sign-ins" },
  { id: "accounts", fr: "Comptes", en: "Accounts" },
  { id: "content", fr: "Contenus", en: "Content" },
  { id: "requests", fr: "Demandes", en: "Requests" },
  { id: "admin", fr: "Administration", en: "Administration" },
  { id: "system", fr: "Système", en: "System" },
];

const LABELS: Record<string, [string, string, ActivityCategory]> = {
  "member.signup": ["Inscription d'un membre", "Member signup", "accounts"],
  "member.login": ["Connexion membre", "Member sign-in", "auth"],
  "member.login_failed": ["Connexion membre échouée", "Failed member sign-in", "auth"],
  "member.logout": ["Déconnexion membre", "Member sign-out", "auth"],
  "member.google_signup": ["Inscription via Google", "Google signup", "accounts"],
  "member.google_login": ["Connexion via Google", "Google sign-in", "auth"],
  "member.profile_updated": ["Profil membre modifié", "Member profile updated", "accounts"],
  "member.email_changed": ["E-mail membre modifié", "Member email changed", "accounts"],
  "member.password_changed": ["Mot de passe membre modifié", "Member password changed", "accounts"],
  "member.password_set": ["Mot de passe membre créé", "Member password created", "accounts"],
  "member.account_deleted": ["Compte membre supprimé", "Member account deleted", "accounts"],
  "member.activated": ["Compte membre activé", "Member account activated", "accounts"],
  "member.deactivated": ["Compte membre désactivé", "Member account deactivated", "accounts"],
  "admin.login": ["Connexion admin", "Admin sign-in", "auth"],
  "admin.login_failed": ["Connexion admin échouée", "Failed admin sign-in", "auth"],
  "admin.logout": ["Déconnexion admin", "Admin sign-out", "auth"],
  "admin.profile_updated": ["Profil admin modifié", "Admin profile updated", "accounts"],
  "admin.password_changed": ["Mot de passe admin modifié", "Admin password changed", "accounts"],
  "admin.user_role_changed": ["Rôle administrateur modifié", "Admin role changed", "admin"],
  "admin.user_activated": ["Compte admin activé", "Admin account activated", "admin"],
  "admin.user_deactivated": ["Compte admin désactivé", "Admin account deactivated", "admin"],
  "quote.created": ["Demande de devis reçue", "Quote request received", "requests"],
  "contact.created": ["Message de contact reçu", "Contact message received", "requests"],
  "registration.created": ["Inscription formation reçue", "Training registration received", "requests"],
};

export function describeAction(action: string): { fr: string; en: string; category: ActivityCategory } {
  const known = LABELS[action];
  if (known) return { fr: known[0], en: known[1], category: known[2] };
  const [scope, verb] = action.split(".");
  const pretty = `${scope.charAt(0).toUpperCase() + scope.slice(1)} · ${verb ?? ""}`.trim();
  const category: ActivityCategory =
    scope === "member" ? "accounts"
    : scope === "admin" ? "admin"
    : ["service", "project", "article", "media", "price", "package"].includes(scope) ? "content"
    : ["quote", "contact", "registration", "message"].includes(scope) ? "requests"
    : "system";
  return { fr: pretty, en: pretty, category };
}
