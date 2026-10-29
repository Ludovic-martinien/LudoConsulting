# Déploiement en production — Ludo_Consulting (ce projet)

Guide exact pour CETTE base de code (vérifié avec l'implémentation réelle).
Ne pas confondre avec d'autres variantes : ici, le callback Google est
`/api/member/google/callback` et les icônes sont dans `/brand/`.

## 0. État actuel

- Le code de CE dossier est la référence testée (build OK avec ET sans base).
- Le dépôt `Ludovic-martinien/LudoConsulting` contient un instantané différent :
  ne fusionnez rien à la main, retransmettez simplement ce dossier comme la dernière fois.

## 1. Base de données Neon (gratuit, ~10 min)

1. Créez un compte sur https://neon.com (connexion avec GitHub possible).
2. **New Project** → nom `ludo-consulting` → région **EU (Francfort)** → Create.
3. Ouvrez **Connection Details** → activez **Pooled connection** → copiez l'URL
   (`postgresql://…`) : c'est votre `DATABASE_URL` de production.
4. **Rien à exécuter à la main** : à la première visite du site, les tables se
   créent toutes seules (migration automatique) puis les contenus de référence
   (8 services, 7 projets, liens sociaux) se préchargent seuls. Première visite
   un peu plus lente, ensuite normal.
   *Secours (rarement nécessaire)* : si la migration automatique échouait,
   ouvrez **SQL Editor → New Query** dans Neon et exécutez, **dans cet ordre**,
   le contenu des fichiers `drizzle/` : `0000_serious_slyde.sql`,
   `0001_daily_may_parker.sql`, `0002_slim_khan.sql`, `0003_majestic_post.sql`,
   `0004_panoramic_captain_stacy.sql`.
5. Vérifiez : `SELECT count(*) FROM services;` doit afficher **8**.

## 2. Variables d'environnement Vercel

Project → **Settings → Environment Variables → Add** (cochez **Production**,
et **Preview** si vous voulez tester avant) :

| Clé (recopier EXACTEMENT) | Valeur | Obligatoire |
|---|---|---|
| `DATABASE_URL` | URL Neon copiée à l'étape 1 | ✅ Oui |
| `NEXT_PUBLIC_SITE_URL` | Votre adresse Vercel, ex. `https://ludo-consulting.vercel.app` | ✅ Oui |
| `ADMIN_EMAIL` | `ludo.consulting3@gmail.com` | Pour l'admin |
| `ADMIN_PASSWORD_HASH` | Empreinte `scrypt:…` (demandez sa génération, ne mettez jamais un mot de passe en clair) | Pour l'admin |
| `ADMIN_SESSION_SECRET` | Secret aléatoire ≥ 32 caractères | Pour l'admin |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Console Google Cloud (voir README) | Optionnel |

Ne partagez jamais ces valeurs dans une conversation : seul le formulaire Vercel doit les voir.

## 3. Déployer et vérifier

1. **Deployments** → `···` sur le dernier → **Redeploy** → attendez **Ready**.
   (Le build réussit même sans base : sans `DATABASE_URL`, le site s'affiche
   avec un sitemap statique et les fonctions base répondent en erreur propre.)
2. Si vous utilisez Google OAuth, ajoutez dans Google Cloud Console l'URI :
   `https://<votre-domaine-vercel>/api/member/google/callback`.
3. Vérifiez : accueil (200), `/api/health` → `{"ok":true}`, inscription membre,
   connexion admin (`/admin/login`), `/manifest.webmanifest`, une demande de devis.
4. Créez un compte de test, vérifiez qu'il apparaît dans **Admin → Membres**,
   puis supprimez-le.

## 4. Mises à jour suivantes

Chaque `git push` vers `main` redéploie automatiquement. Ne commitez jamais `.env`
(protégé par `.gitignore`, vérifié). Pour appliquer de futures migrations :
réexécutez les nouveaux fichiers `drizzle/*.sql` dans l'éditeur SQL de Neon, dans l'ordre.
