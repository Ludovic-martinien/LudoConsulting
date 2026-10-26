import type { CSSProperties } from "react";
import type { DeckPreview } from "@/lib/deck";

type Colors = { primary: string; accent: string; soft: string; ink: string };

function Window({ title, colors, children }: { title: string; colors: Colors; children: React.ReactNode }) {
  return (
    <div className="ui-window" style={{ "--ui-primary": colors.primary, "--ui-accent": colors.accent, "--ui-soft": colors.soft, "--ui-ink": colors.ink } as CSSProperties}>
      <div className="ui-bar"><i /><i /><i /><span>{title}</span></div>
      <div className="ui-body">{children}</div>
      <div className="ui-caption">Maquette illustrative — interface non finalisée</div>
    </div>
  );
}

export function UiPreview({ kind, colors }: { kind: DeckPreview; colors: Colors }) {
  if (kind === "delivery") {
    return (
      <Window title="Hydro-Track · Suivi de commande" colors={colors}>
        <div className="ui-row-between"><div><p className="ui-kicker">Commande</p><strong className="ui-ref">Démo · référence</strong></div><span className="ui-pill">Suivi</span></div>
        <div className="ui-steps">
          <span className="is-done">Commande reçue</span><span className="is-done">En préparation</span><span className="is-active">En livraison</span><span>Livré</span>
        </div>
        <div className="ui-tiles">
          <div className="ui-tile"><small>Produit</small><strong>Pack d'eau</strong></div>
          <div className="ui-tile"><small>Livreur</small><strong>Assigné</strong></div>
          <div className="ui-tile"><small>Adresse</small><strong>Saisie</strong></div>
        </div>
        <div className="ui-line" /><div className="ui-line short" />
      </Window>
    );
  }
  if (kind === "documents") {
    return (
      <Window title="LudoConnect · Recherche" colors={colors}>
        <div className="ui-search">Rechercher par catégorie de document…</div>
        <div className="ui-tiles">
          <div className="ui-tile"><small>Catégorie</small><strong>Carte d'identité</strong></div>
          <div className="ui-tile"><small>Catégorie</small><strong>Passeport</strong></div>
          <div className="ui-tile"><small>Catégorie</small><strong>Permis</strong></div>
        </div>
        <div className="ui-note">Aucune donnée personnelle réelle affichée. Numéros de documents masqués.</div>
        <div className="ui-line" /><div className="ui-line short" />
        <span className="ui-pill">Signalement vérifié avant restitution</span>
      </Window>
    );
  }
  if (kind === "vault") {
    return (
      <Window title="SafeGabon · Coffre-fort" colors={colors}>
        <div className="ui-row-between"><span className="ui-pill">Catégories</span><span className="ui-pill muted">Recherche</span></div>
        <div className="ui-vault-row"><span className="ui-dot" /><div><strong>Identifiant fictif</strong><small>••••••••••••</small></div><span className="ui-tag">Masqué</span></div>
        <div className="ui-vault-row"><span className="ui-dot alt" /><div><strong>Identifiant fictif</strong><small>••••••••••••</small></div><span className="ui-tag">Masqué</span></div>
        <div className="ui-vault-row"><span className="ui-dot gold" /><div><strong>Identifiant fictif</strong><small>••••••••••••</small></div><span className="ui-tag">Masqué</span></div>
        <div className="ui-note">Mots de passe de démonstration. Le coffre ne retrouve pas un mot de passe jamais enregistré.</div>
      </Window>
    );
  }
  if (kind === "jobs") {
    return (
      <Window title="TAF-GAB 2.0 · Profil exemple" colors={colors}>
        <div className="ui-profile"><span className="ui-avatar" /><div><strong>Profil exemple</strong><small>Candidat — domaine d'activité</small></div><span className="ui-pill">CV numérique</span></div>
        <div className="ui-tiles">
          <div className="ui-tile"><small>Vidéo</small><strong>Présentation</strong></div>
          <div className="ui-tile"><small>Badges</small><strong>Compétences déclarées</strong></div>
          <div className="ui-tile"><small>Documents</small><strong>CV · Lettre</strong></div>
        </div>
        <div className="ui-line" /><div className="ui-line short" />
        <div className="ui-note">Badges non certifiés par défaut. Aucune garantie d'emploi.</div>
      </Window>
    );
  }
  return (
    <Window title="Edu-Nify · Classe virtuelle" colors={colors}>
      <div className="ui-class-grid">
        <div className="ui-screen"><span>Tableau blanc</span><i /><i /><i /></div>
        <div className="ui-side-list">
          <div className="ui-participant"><span className="ui-avatar sm" /><div><strong>Enseignant</strong><small>Micro actif</small></div></div>
          <div className="ui-participant"><span className="ui-avatar sm alt" /><div><strong>Apprenant</strong><small>Présent</small></div></div>
          <div className="ui-participant"><span className="ui-avatar sm gold" /><div><strong>Apprenant</strong><small>Présent</small></div></div>
        </div>
      </div>
      <div className="ui-tiles compact">
        <div className="ui-tile"><small>Outils</small><strong>Partage d'écran</strong></div>
        <div className="ui-tile"><small>Outils</small><strong>Messagerie</strong></div>
        <div className="ui-tile"><small>Outils</small><strong>Enregistrement</strong></div>
      </div>
    </Window>
  );
}
