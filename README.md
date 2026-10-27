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

## Espace membre et connexion Google

Les visiteurs peuvent créer un compte depuis l'en-tête ou le bandeau « Espace membre » de l'accueil, puis se connecter :
- **E-mail + mot de passe** : fonctionne immédiatement, sans service externe. Mots de passe hachés en scrypt, sessions signées (cookie `ludo_member_session`, 30 jours), limitation des tentatives.
- **Contenus réservés** : la navigation Services, Réalisations, Formations et Tarifs ainsi que le bouton WhatsApp ne s'affichent qu'aux visiteurs connectés (membre ou admin). Les autres pages restent publiques pour le référencement.
- **Page profil** (`/profil`) : chaque membre y modifie son nom, son téléphone, son e-mail (avec confirmation par mot de passe actuel), son mot de passe, et peut supprimer son compte (confirmation exigée). Table `users`, colonnes `phone` et `terms_accepted_at`.
- **Bouton Google** : nécessite des identifiants OAuth créés par le propriétaire du site (voir ci-dessous). Tant qu'ils sont absents, le bouton affiche un message l'indiquant et l'inscription e-mail reste disponible.

### Activer la connexion Google (5 minutes)

1. Ouvrir [Google Cloud Console](https://console.cloud.google.com/) → créer ou choisir un projet → **API et services → Écran d'autorisation OAuth** : choisir « Externe », renseigner nom de l'application, e-mail d'assistance et e-mail développeur, puis publier (ou ajouter des utilisateurs test).
2. **API et services → Identifiants → Créer des identifiants → ID client OAuth** : type « Application Web ».
3. Dans **URI de redirection autorisés**, ajouter exactement (une ligne par environnement) :
   - `https://VOTRE-DOMAINE/api/auth/google/callback` (production)
   - l'URL de prévisualisation `https://....e2b.app/api/auth/google/callback` (bac à sable)
   - `http://localhost:3000/api/auth/google/callback` (développement local)
4. Copier l'**ID client** et le **Secret client** dans l'environnement du site :
   - `GOOGLE_CLIENT_ID=...apps.googleusercontent.com`
   - `GOOGLE_CLIENT_SECRET=...`
5. Redéployer / redémarrer. Vérifier `GET /api/auth/providers` : `"google": true`.
6. Tester : cliquer « Continuer avec Google », choisir un compte, vérifier le retour sur l'accueil avec le profil connecté.

Notes : les comptes Google sont créés dans la table `users` (`provider = 'google'`, sans mot de passe). Si un visiteur s'était déjà inscrit avec le même e-mail, son compte existant est relié à Google au lieu d'être dupliqué. Le paramètre anti-CSRF `state` est signé et limité à 10 minutes.

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
