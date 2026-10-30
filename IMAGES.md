# Réception des visuels officiels — Ludo_Consulting

> **État : archive `portfolie.rar` non reçue.** Aucun des fichiers ci-dessous
> n'est présent dans l'environnement. Ce document est le plan de réception :
> dès qu'un fichier arrive, il suit la colonne « Destination » puis la colonne
> « Activation », sans autre modification de code.

## Règle d'or

- **Ne jamais écraser un fichier existant sans vérifier qu'il est remplacé.**
- **Ne jamais référencer un fichier absent** : chaque référence pointe vers un
  repli qui fonctionne déjà (vérifié en build).
- Formats acceptés partout : **JPG, PNG, WebP** (les SVG sont refusés en
  téléversement pour des raisons de sécurité).
- Noms assainis à la réception : minuscules, sans espaces, sans apostrophes.

## Table de correspondance (15 fichiers attendus)

| Fichier reçu | Destination exacte | Slot admin (`/admin/media`) | Activation (quoi faire à réception) |
|---|---|---|---|
| `Ludo_Consulting.jpeg` | `public/brand/logo/ludo-consulting.jpeg` | `logo-site` — **téléverser ici en priorité** : le header/footer basculent seuls dessus, avec repli SVG | Aucune : automatique après téléversement |
| `responsable.png` | `public/images/profil/responsable.png` | `profile-photo` — téléverser ici | Aucune : la photo du header, de la section Responsable et de À propos bascule seule |
| `Edu-Nify.png` | `public/brand/projects/edu-nify.png` | `logo-edu-nify` — téléverser ici | Aucune : la présentation et le portfolio basculent seuls |
| `Edu_Nify_app.png` | `public/images/projects/edu-nify/application.png` | `cover-edu-nify-app` — téléverser ici | Choisir comme image du projet Edu-Nify depuis `/admin/projects`, ou me le signaler |
| `Edu_Link.png` | `public/brand/projects/edulink.png` | `logo-edulink` — téléverser ici | Aucune : le logo devient disponible pour la fiche EduLink (me signaler pour l'y associer) |
| `Edu_Link_app.png` | `public/images/projects/edulink/application.png` | `cover-edulink-app` — téléverser ici | Choisir comme image du projet EduLink depuis `/admin/projects`, ou me le signaler |
| `Hydro-Track.jpeg` | `public/brand/projects/hydro-track.jpeg` | *(pas de slot : fichier statique)* — me signaler | Je mets à jour la référence du projet |
| `logo-taf-gab-2.0.png` | `public/brand/projects/taf-gab-2.0.png` | *(pas de slot : fichier statique)* — me signaler | Je mets à jour la référence du projet |
| `LudoDoc _Connect.png` → renommer `ludodoc-connect-alt.png` | `public/images/projects/ludoconnect/` | `image-ludoconnect-alt` — téléverser ici | Choisir comme visuel complémentaire, ou me le signaler |
| `LudoDoc_Connect.png` | `public/brand/projects/ludoconnect.png` | *(pas de slot : fichier statique)* — me signaler | Je mets à jour la référence du projet |
| `LudoDoc_Connect_aa.jpg` | `public/images/projects/ludoconnect/complementaire.jpg` | *(fichier statique)* — me signaler | Je l'intègre comme visuel complémentaire |
| `GestCom.jpg` | `public/images/projects/gestion-commerciale/gestcom.jpg` | `image-gestcom` — téléverser ici | Choisir comme image du projet depuis `/admin/projects`, ou me le signaler |
| `Dis'School.png` → renommer `dis-school.png` | `public/brand/projects/dis-school.png` | `logo-dis-school` — téléverser ici | **Créer le projet Dis'School** depuis `/admin/projects`, ou me le signaler |
| `Dis'School_app.jpg` → renommer `dis-school-app.jpg` | `public/images/projects/dis-school/application.jpg` | `cover-dis-school-app` — téléverser ici | Associer au projet Dis'School, ou me le signaler |

## Notes d'identification (§6)

- **Logo vs capture** : les fichiers `logo-*` vont dans `public/brand/projects/` (affichés avec `object-fit: contain`, proportions conservées) ; les fichiers `*_app.*` vont dans `public/images/projects/<projet>/` (captures lisibles, proportions d'origine).
- **LudoConnect (3 fichiers)** : `LudoDoc_Connect.png` = visuel principal ; `LudoDoc _Connect.png` (attention à l'espace, à renommer) et `LudoDoc_Connect_aa.jpg` = complémentaires.
- **EduLink** : le portfolio utilise aujourd'hui une capture générée (`edulink-preview.webp`) ; `Edu_Link.png` est le **logo officiel** (usage distinct : présentation et identité du projet).
- **Dis'School** : nouveau projet absent de la base — logo + capture réservés, fiche à créer.
- **Hydro-Track, TAF-GAB 2.0** : visuels statiques actuels conservés jusqu'au remplacement confirmé.

## Deux voies d'arrivée des fichiers

1. **Téléversement admin** (`/admin/media`, slots ci-dessus) : effet immédiat, base prioritaire, fichiers versionnés. Recommandé.
2. **Dépôt direct** dans les dossiers ci-dessus (via GitHub ou environnement), puis me signaler les chemins : je mets à jour les références et je vérifie chaque image (checklist §8 du cahier).
