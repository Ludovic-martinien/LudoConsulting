# Ludo_Consulting — plateforme professionnelle

Application Next.js (App Router), TypeScript, PostgreSQL et Drizzle ORM pour présenter les services et projets de Ludo_Consulting, recevoir des demandes et gérer les contenus depuis un espace privé.

## Fonctionnalités livrées

- Site public responsive en français et en anglais, avec préférence de langue conservée dans le navigateur.
- Accueil, à propos, services et fiches de services, tarifs, formations, portfolio et fiches de projets, compétences, blog, contact, demande de devis et pages légales.
- Catalogue PostgreSQL préchargé avec les huit domaines et toutes les prestations prévues.
- Tarifs confirmés stockés dans PostgreSQL : Standard 35 000 FCFA, Premium 65 000 FCFA, cybersécurité à partir de 120 000 FCFA, tarifs académiques dès 25 000 / 35 000 / 45 000 FCFA.
- Edu-Nify et Gestion commerciale & facturation présentés avec un statut général « à confirmer », sans lien de démonstration fictif. Les fonctionnalités mentionnées sont initialisées comme planifiées.
- Formulaires de contact, de devis et de demande d'inscription enregistrés en base avec validation serveur, consentement, contrôle d'origine, honeypot et limitation des soumissions.
- Administration privée par session signée, cookie HttpOnly/SameSite strict, empreinte scrypt et contrôle de rôles côté serveur. Gestion des services, prix, prestations, projets, articles, demandes, messages et journal d'activité.
- Sitemap dynamique, robots, métadonnées Open Graph et en-têtes HTTP de sécurité.
- Identité visuelle Ludo_Consulting : emblème bleu/or fourni en SVG dans `public/brand/` (`ludo-emblem.svg` complet, `ludo-mark.svg` compact et favicon `src/app/icon.svg`). Ils remplacent l'ancien monogramme dans l'en-tête, le pied de page, la connexion et l'administration.
- Projet EduLink ajouté au portfolio avec son visuel optimisé `public/images/edulink-preview.webp`, un statut « projet conceptuel » et des fonctionnalités marquées comme prévues. Le visuel est une maquette de présentation, pas une preuve de mise en production.
- **Présentation des projets** sur `/presentation` : 12 diapositives 16:9 (Hydro-Track, LudoConnect, SafeGabon, TAF-GAB 2.0, Edu-Nify), comparatif, besoins, perspectives, statut de maturité et conclusion. Export PDF via le bouton « Exporter en PDF » (impression navigateur en paysage). Les maquettes d'interface sont explicitement illustratives et sans données personnelles réelles.
- **Section « Le responsable »** sur l'accueil et portrait sur la page « À propos », alimentés par la photo officielle déposée en administration.
- **Gestion des visuels officiels** dans `/admin/media` : téléversement de la photo du responsable et des cinq logos. Aucun logo n'est redessiné, fusionné ou généré automatiquement.

## Prérequis

- Node.js compatible avec Next.js 16.
- PostgreSQL accessible à l'application.
- Variables d'environnement configurées (voir `.env.example`).

## Visuels officiels : logos et photo du responsable

Les images jointes à une conversation ne sont pas accessibles comme fichiers du projet. Aucun logo n'a donc été redessiné ni généré par IA : tant qu'un fichier officiel n'est pas déposé, un **emplacement réservé** portant la mention « Logo officiel à intégrer » est affiché dans la présentation.

1. Se connecter à `/admin/login`.
2. Ouvrir **Photo & logos**.
3. Déposer la photo du responsable (JPG/PNG/WebP, 5 Mo max) et chaque logo officiel (JPG/PNG/WebP, 2 Mo max).

Les fichiers sont stockés dans la table `uploaded_images` et servis par `/api/media/[kind]` avec un en-tête `X-Content-Type-Options: nosniff`. Les SVG ne sont pas acceptés en téléversement (risque d'exécution de script) : pour un logo vectoriel, placer le fichier dans `public/brand/projects/` et référencer son chemin dans le code.

**Cahiers des charges** (`/cahiers-des-charges`, réservé aux membres) : l'admin téléverse
des PDF depuis son appareil (`/admin/documents`, 4 Mo max, signature `%PDF-` vérifiée,
table `project_documents`). Les membres consultent en ligne (visionneuse intégrée) ou
téléchargent. Le fichier lui-même exige une session membre ou staff (`401` sinon) et
les brouillons restent invisibles aux membres.

**Réseaux sociaux du pied de page** : colonne « Suivez-nous » alimentée par la table
`social_links` (GitHub, Facebook, chaîne WhatsApp, LinkedIn, TikTok, Telegram, Discord —
URL nettoyées de tout paramètre de suivi). Chaque réseau utilise son **icône officielle**
(tracés simple-icons, licence CC0, copiés dans `src/components/social-icons.tsx`, sans
dépendance au runtime). Préchargement idempotent + contrainte d'unicité sur `platform`.
Pour ajouter un réseau : insérez une ligne dans `social_links` (un réseau sans icône
connue s'affiche en lien texte).

**Logo officiel du site** : `public/brand/Ludo_Consulting.svg` — recréation vectorielle fidèle de l'emblème officiel (anneau bleu marine et or, monogramme LC en circuits, nuage, ordinateur, bouclier verrouillé, téléphone, flèche de croissance, textes circulaires et numéros de téléphone). Utilisé dans l'en-tête, le pied de page, la connexion et comme favicon. Les déclinaisons PNG (`-192`, `-512`, `-180`, `-maskable-512`) sont générées depuis ce SVG et servent aussi d'icônes PWA. Pour installer le fichier officiel exact sans changer le code, remplacez simplement ce fichier en conservant son nom, puis régénérez les PNG.

### Point de nom à confirmer

Le brief mentionne « **SateGabon** », tandis que le logo officiel fourni affiche « **SafeGabon** » (avec la signature « Sécurisez ce qui compte »). La présentation suit le logo fourni et affiche donc **SafeGabon**. Le nom définitif doit être confirmé avant diffusion ; un seul remplacement est alors nécessaire dans `src/lib/deck.ts` et dans le libellé du média correspondant.

## Installation locale

```bash
npm ci
cp .env.example .env
```

Renseigner `DATABASE_URL`, puis créer ou actualiser le schéma :

```bash
npx drizzle-kit push
```

Démarrer le site :

```bash
npm run dev
```

Les données initiales sont insérées une seule fois de manière transactionnelle au premier accès public. Les formulaires ne créent pas de données de démonstration.

## Comptes membres et connexion Google

L'espace membre (`/#espace-membre`, page `/compte`) permet aux visiteurs de créer un compte
par e-mail + mot de passe (empreinte scrypt, 10 caractères minimum) ou de se connecter
avec Google (flux OAuth 2.0 officiel : code d'autorisation, jeton échangé côté serveur,
profil lu via `userinfo`). Les sessions membres (30 jours, cookie `HttpOnly`, `SameSite=Lax`)
sont stockées dans `member_sessions`, les profils dans `member_users`, et chaque
connexion (inscription, mot de passe, Google) est consignée dans `member_login_events`
— visible par le membre sur `/compte` (« Dernières connexions »). La suppression du
compte (`Mon compte → Supprimer`) efface le profil, ses sessions et son historique
(suppression en cascade). La politique de confidentialité (`/privacy`) décrit ces traitements.

L'en-tête affiche un simple bouton icône : un clic ouvre une fenêtre modale
Connexion / Inscription (fermeture par croix, clic extérieur ou touche Échap, focus
automatique), réutilisant les mêmes formulaires que la section `/#espace-membre`.

**Rubriques réservées aux membres** : Services, Réalisations, Tarifs, Formations et le
bouton WhatsApp flottant ne s'affichent que pour les membres connectés — dans la
navigation comme sur les pages (redirection vers `/#espace-membre` sinon, vérifiée
côté serveur). Sur l'accueil, les grilles Services et Réalisations sont remplacées par
des teasers verrouillés invitant à se connecter, et la page `/presentation` est
également réservée aux membres. Elles sont exclues du sitemap tant que ce mode est actif.
La barre de navigation garde une mise en page stable (`nowrap`, aucun chevauchement)
quel que soit l'état de connexion, sur toutes les tailles d'écran. Le pied de page
suit la même règle pour sa colonne Explorer.

**Profil membre** (`/compte`) : le membre modifie son nom affiché, ajoute ou change
son mot de passe (l'ancien est exigé s'il existe), consulte ses dernières connexions
et supprime son compte. **Administration → Membres** (rôle `admin` uniquement) :
liste complète (moyens de connexion, sessions actives, dernière activité, historique)
et suppression de comptes, avec journalisation des actions.

Activation de Google (5 minutes, sans quoi seul l'e-mail fonctionne et un message
l'indique honnêtement sur le site) :

1. Console Google Cloud → nouveau projet → Écran de consentement OAuth (externe) → publier.
2. Identifiants → Créer des identifiants → ID client OAuth → Application Web.
3. URI de redirection autorisée : `https://VOTRE-DOMAINE/api/member/google/callback`
   (en prévisualisation sandbox, ajoutez l'URL exacte fournie à chaque redémarrage,
   car elle change : la redirection est déduite de la requête).
4. Renseignez `GOOGLE_CLIENT_ID` et `GOOGLE_CLIENT_SECRET` dans l'environnement
   (voir `.env.example`). Ne les exposez jamais avec `NEXT_PUBLIC_`.

Limites assumées : aucun e-mail de vérification n'est envoyé sans service SMTP configuré ;
l'e-mail des comptes Google est marqué vérifié (attesté par Google), celui des comptes
e-mail ne l'est pas.

## Application installable (PWA)

Le site est une Progressive Web App : `src/app/manifest.ts` expose `/manifest.webmanifest`
(nom, icônes 192/512 + maskable, couleurs, affichage `standalone`) et `public/sw.js`
assure l'installabilité avec un cache limité aux fichiers statiques versionnés
(`/_next/static/`, URLs hachées et immuables). **Aucune page ni aucun appel API n'est
mis en cache** : aucun risque de contenu périmé.

Sur le navigateur, une bannière **« Installer l'application Ludo_Consulting ? »**
apparaît automatiquement quand l'installation est possible (événement
`beforeinstallprompt`, Chrome/Edge Android et desktop). Le bouton déclenche
l'installation native ; un refus mémorise le choix 7 jours. Sur iPhone (Safari ne
proposant pas d'installation automatique), la bannière affiche la marche à suivre :
Partager → « Sur l'écran d'accueil ». Une fois installée, l'application ne propose
plus la bannière (`display-mode: standalone` détecté).

Prérequis réels : HTTPS (actif en production), `sw.js` servi sans cache
(`Cache-Control: no-store` configuré dans `next.config.ts`) et icônes 192/512 valides.

## Administration : connexion unifiée, profil, statistiques et journal

**Connexion unifiée** : le formulaire membre (`/#espace-membre`, onglets Connexion /
Inscription) accepte aussi les identifiants administrateur : le rôle est détecté
côté serveur et un admin est redirigé vers `/admin`, un membre vers `/compte`. Le
formulaire dédié `/admin/login` reste disponible. L'adresse e-mail administrateur est
réservée (aucun compte membre ne peut l'utiliser).

**Tableau de bord** (`/admin`) : cartes temps réel (membres, sessions actives,
inscriptions, connexions, demandes, actions journalisées, staff) avec deltas calculés
contre la période précédente, courbes 7j/30j/12m, anneau des rôles, activité par type,
comparaison de périodes, tableaux récents. Actualisation manuelle + auto toutes les 60 s.
Aucune donnée de démonstration.

**Journal d'activité** (`/admin/activity`) : `admin.login/logout`, échecs de connexion
(sans mot de passe), inscriptions/connexions/déconnexions membres, formulaires reçus,
modifications de profil, suppressions, actions contenus — avec acteur, objet, résultat,
filtres et pagination. Les administrateurs ne peuvent pas l'effacer depuis l'interface.

**Rôles** (`/admin/roles`) : détectés depuis `admin_users` + `member_users`, effectifs,
matrice des permissions réellement appliquées côté serveur, activation/suspension et
changement de rôle (jamais sur son propre compte, chaque action journalisée).

**Mon profil** (`/admin/profil`) : nom affiché modifiable ; e-mail et rôle verrouillés
(le mot de passe reste géré par `ADMIN_PASSWORD_HASH`, voir ci-dessous).

**Déconnexion** : confirmation, session invalidée et journalisée, retour à l'accueil
public `/`. Les pages `/admin/*` envoient `Cache-Control: no-store` : le bouton Retour
ne rouvre jamais une session fermée.

**Notifications et recherche** : la cloche affiche les demandes au statut « nouveau »,
la recherche globale interroge membres, devis et messages.

## Compte administrateur

L'authentification n'utilise pas de compte par défaut, de mot de passe en clair ni de valeur codée dans le dépôt. Avant la mise en service, définir dans le gestionnaire de secrets de l'environnement :

- `ADMIN_EMAIL` : adresse autorisée (par défaut, l'adresse professionnelle officielle).
- `ADMIN_PASSWORD_HASH` : empreinte scrypt au format `scrypt:<salt_hex>:<hash_hex>` (hash de 64 octets). L'ancien format à séparateurs `$` reste accepté lorsqu'il est fourni directement par l'environnement.
- `ADMIN_SESSION_SECRET` : secret aléatoire d'au moins 32 caractères.

Exemple de génération d'une empreinte depuis un terminal local sécurisé (ne pas inscrire le mot de passe dans le dépôt ni dans un ticket) :

```bash
ADMIN_SETUP_PASSWORD='choisir-un-secret-long' node -e 'const c=require("node:crypto");const salt=c.randomBytes(16).toString("hex");console.log(`scrypt:${salt}:${c.scryptSync(process.env.ADMIN_SETUP_PASSWORD,salt,64).toString("hex")}`)'
```

Générer le secret de session séparément :

```bash
openssl rand -base64 48
```

Ouvrir ensuite `/admin/login`. Les tentatives de connexion sont limitées. Les sessions expirent après huit heures. Le compte administrateur doit utiliser un mot de passe long et unique.

Le modèle contient les rôles `admin`, `editor` et `sales`, et les routes vérifient les rôles côté serveur. Cette version s'authentifie avec un seul compte propriétaire configuré par environnement; une interface d'invitation et d'authentification multi-utilisateur n'est pas incluse. Ne pas ajouter d'autres comptes avant d'avoir choisi un mécanisme d'identité adapté.

## Migrations et déploiement Vercel

Le schéma est décrit dans `src/db/schema.ts`. Pour générer des migrations versionnées après une évolution du schéma :

```bash
npx drizzle-kit generate
```

En développement, `npx drizzle-kit push` applique directement le schéma. Pour une chaîne de livraison versionnée, examiner et committer les fichiers SQL générés, puis appliquer les migrations dans l'environnement cible avec :

```bash
npx drizzle-kit migrate
```

Étapes Vercel recommandées :

1. Créer une base PostgreSQL persistante et un rôle à privilèges minimaux; ne pas utiliser la base locale du sandbox en production.
2. Connecter le dépôt Git à Vercel et sélectionner Next.js.
3. Ajouter `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH` et `ADMIN_SESSION_SECRET` dans les paramètres d'environnement Vercel. Utiliser des secrets différents pour preview et production.
4. Appliquer le schéma/migrations avant le premier déploiement public.
5. Vérifier `/api/health`, les pages publiques et les formulaires après déploiement.
6. Tester `/admin/login` après avoir configuré les secrets administrateur.

La route de santé confirme la connexion PostgreSQL. Elle ne vérifie pas qu'un fournisseur d'e-mail, de stockage de fichiers ou d'analytique est configuré.

## Notifications, fichiers et intégrations non configurés

- Les formulaires enregistrent les demandes en base et les rendent visibles à l'administration; aucune notification e-mail n'est envoyée dans cette version. Ajouter un fournisseur d'e-mail côté serveur avant d'activer un accusé de réception.
- Les pièces jointes, particulièrement les documents académiques, sont désactivées. Aucun fichier n'est envoyé ou rendu public. Avant de les activer, ajouter un stockage privé, des contrôles MIME/poids, des URL signées, une politique de rétention et des tests d'autorisation.
- Le catalogue WhatsApp renvoie vers le lien fourni `https://wa.me/c/24106654235`. Aucun numéro de discussion directe non vérifié n'est publié.
- Aucun profil social non fourni, témoignage, client, diplôme, métrique de trafic ou réalisation supplémentaire n'est inventé.
- Aucun outil d'analytique publicitaire n'est activé.
- Les textes juridiques sont des préparations et doivent être vérifiés par une personne compétente au regard de la situation de Ludo_Consulting et du droit gabonais. Les champs légaux non confirmés restent à compléter.

## Sauvegarde et restauration PostgreSQL

Exécuter ces commandes depuis un environnement sécurisé disposant de `pg_dump` / `psql`. Le fichier de sauvegarde contient potentiellement des données personnelles; le chiffrer et le stocker dans un emplacement privé avec accès restreint.

```bash
pg_dump "$DATABASE_URL" --format=custom --file=ludo-consulting-$(date +%F).dump
```

Restauration contrôlée vers une base de test (recommandée avant production) :

```bash
pg_restore --clean --if-exists --no-owner --dbname="$DATABASE_URL" ludo-consulting-YYYY-MM-DD.dump
```

Définir et documenter un calendrier de sauvegarde, une rétention, les responsables d'accès et un test périodique de restauration.

## Tables principales

`profiles`, `services`, `service_items`, `service_prices`, `service_packages`, `project_categories`, `projects`, `technologies`, `project_technologies`, `skills`, `article_categories`, `articles`, `contact_messages`, `quote_requests`, `registrations`, `media_assets`, `social_links`, `site_settings`, `admin_users`, `activity_logs`, `testimonials` et `uploaded_images`.

Les accès PostgreSQL sont exclusivement côté serveur par Drizzle. Les pages publiques ne lisent que les données de contenu publiées; les messages, devis, notes internes et comptes ne sont accessibles qu'aux routes/pages administratives autorisées.

## Vérifications

```bash
npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build
```

Vérifier également les scénarios métier : modification d'un prix en admin, création d'un projet en brouillon, publication d'un article, refus de `/admin` sans session, enregistrement d'un message/devis, et persistance après actualisation.

Pour la présentation : ouvrir `/presentation`, vérifier les 12 diapositives, contrôler que les mentions « fonctionnalités envisagées » et « maquette illustrative » sont visibles, puis utiliser « Exporter en PDF » avec l'orientation paysage. Après téléversement des logos et de la photo, vérifier qu'ils apparaissent bien dans la présentation, sur l'accueil et sur la page « À propos ».
