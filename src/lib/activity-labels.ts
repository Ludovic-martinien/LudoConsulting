/** Libellés des actions du journal — utilisable côté client et serveur (aucune dépendance Node). */
export const ACTION_LABELS: Record<string, { fr: string; en: string }> = {
  "admin.login": { fr: "Connexion administrateur", en: "Admin sign-in" },
  "admin.login_failed": { fr: "Tentative de connexion admin échouée", en: "Failed admin sign-in attempt" },
  "admin.logout": { fr: "Déconnexion administrateur", en: "Admin sign-out" },
  "member.register": { fr: "Création d'un compte membre", en: "Member account created" },
  "member.login": { fr: "Connexion membre", en: "Member sign-in" },
  "member.login_failed": { fr: "Tentative de connexion membre échouée", en: "Failed member sign-in attempt" },
  "member.logout": { fr: "Déconnexion membre", en: "Member sign-out" },
  "member.profile_update": { fr: "Modification du profil membre", en: "Member profile updated" },
  "member.deleted": { fr: "Suppression d'un compte membre", en: "Member account deleted" },
  "member.delete": { fr: "Suppression d'un compte membre par l'admin", en: "Member account deleted by admin" },
  "admin.profile_update": { fr: "Modification du profil admin", en: "Admin profile updated" },
  "admin.role_change": { fr: "Modification d'un rôle", en: "Role changed" },
  "admin.user_status": { fr: "Activation / suspension d'un compte", en: "Account enabled / suspended" },
  "form.received": { fr: "Demande reçue via un formulaire", en: "Form request received" },
  "quote.status": { fr: "Suivi d'un devis", en: "Quote follow-up" },
  "contact.status": { fr: "Suivi d'un message", en: "Message follow-up" },
  "registration.status": { fr: "Suivi d'une inscription", en: "Registration follow-up" },
  "service.create": { fr: "Création d'un service", en: "Service created" },
  "service.update": { fr: "Modification d'un service", en: "Service updated" },
  "project.create": { fr: "Création d'un projet", en: "Project created" },
  "project.update": { fr: "Modification d'un projet", en: "Project updated" },
  "project.delete": { fr: "Suppression d'un projet", en: "Project deleted" },
  "article.create": { fr: "Création d'un article", en: "Article created" },
  "article.publish": { fr: "Publication d'un article", en: "Article published" },
  "article.update": { fr: "Modification d'un article", en: "Article updated" },
  "article.delete": { fr: "Suppression d'un article", en: "Article deleted" },
  "media.upload": { fr: "Téléversement d'un média", en: "Media uploaded" },
  "media.delete": { fr: "Suppression d'un média", en: "Media deleted" },
  "document.upload": { fr: "Téléversement d'un cahier des charges", en: "Specification uploaded" },
  "document.update": { fr: "Modification d'un cahier des charges", en: "Specification updated" },
  "document.delete": { fr: "Suppression d'un cahier des charges", en: "Specification deleted" },
};

export function actionLabel(action: string, locale: "fr" | "en") {
  const entry = ACTION_LABELS[action];
  if (entry) return locale === "fr" ? entry.fr : entry.en;
  return action;
}
