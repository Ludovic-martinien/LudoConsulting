# Déploiement en production — Ludo_Consulting

Guide vérifié pour publier ce projet sur **Vercel** (compte `ludovic-martinien`) depuis **GitHub** (`Ludovic-martinien/LudoConsulting`), avec base **PostgreSQL hébergée**.

## 0. Prérequis constatés

- Le dépôt `Ludovic-martinien/LudoConsulting` existe et est **vide** (branche `main`) : prêt à recevoir le code.
- Le projet compile (`next build` OK), 100 % runtime Node.js, aucune dépendance native dans le code applicatif.
- La base locale du bac à sable (`127.0.0.1`) n'est **pas** accessible depuis Vercel : une base PostgreSQL hébergée est obligatoire (recommandé : [Neon](https://neon.com), offre gratuite, compatible Postgres + Drizzle).

## 1. Pousser le code vers GitHub (depuis un terminal avec vos accès)

```bash
git clone <dossier-du-projet>  # ou récupérez le code depuis Arena.ai
cd <dossier-du-projet>
git remote set-url origin https://github.com/Ludovic-martinien/LudoConsulting.git
git fetch origin          # le dépôt est vide : rien à fusionner
git push -u origin main   # identifiants GitHub demandés (utilisez un token, jamais --force)
```

Vérifiez sur github.com que les fichiers sont présents et que `.env` est **absent** (protégé par `.gitignore`).

## 2. Créer la base PostgreSQL de production (Neon)

1. Créez un compte sur https://neon.com → nouveau projet (région la plus proche, ex. EU).
2. Ouvrez l'onglet **Connection Details**, activez le mode **Pooled connection** (recommandé pour serverless/Vercel).
3. Copiez la chaîne `DATABASE_URL` (format `postgresql://...pooler...`).
4. **Rien d'autre à faire pour la base** : le fichier `vercel.json` du projet exécute automatiquement `npx drizzle-kit migrate` avant chaque build, ce qui crée les 23 tables (vérifié sur base vide).
5. Les contenus de référence (services, profil, liens sociaux, projets) se créent automatiquement à la première visite grâce à `ensureSeedData`.

## 3. Importer dans Vercel

1. Sur https://vercel.com/ludovic-martinien → **Add New → Project** → **Import** le dépôt `LudoConsulting`.
2. Framework détecté automatiquement : **Next.js**. La commande de build personnalisée `vercel.json` (`npx drizzle-kit migrate && npm run build`) est reprise automatiquement : les tables sont créées avant la compilation. Laissez le reste par défaut :
   - Output Directory : (défaut Next.js)
   - Install Command : `npm install`
3. **Avant de déployer**, renseignez les variables d'environnement (**Settings → Environment Variables**, scopes Production + Preview) :

| Variable | Valeur | Obligatoire |
|---|---|---|
| `DATABASE_URL` | Chaîne Neon **pooled** | ✅ Oui (sans elle, le build échoue) |
| `NEXT_PUBLIC_SITE_URL` | `https://<votre-domaine-vercel>` | ✅ Oui (SEO, sitemap, OAuth) |
| `ADMIN_EMAIL` | `ludo.consulting3@gmail.com` | ✅ Oui |
| `ADMIN_PASSWORD_HASH` | Empreinte scrypt (voir ci-dessous) | ✅ Oui |
| `ADMIN_SESSION_SECRET` | Secret aléatoire ≥ 32 caractères | ✅ Oui |
| `MEMBER_SESSION_SECRET` | Secret aléatoire ≥ 32 caractères | Recommandé (sinon repli admin) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Console Google Cloud (voir README) | Optionnel (bouton Google) |

Générer l'empreinte du mot de passe admin et un secret (ne jamais mettre un mot de passe en clair) :

```bash
node -e "const c=require('node:crypto');const s=c.randomBytes(16).toString('hex');console.log('scrypt:'+s+':'+c.scryptSync('VOTRE_MOT_DE_PASSE_SOLIDE',s,64).toString('hex'))"
node -e "console.log(require('node:crypto').randomBytes(48).toString('base64'))"
```

4. Cliquez **Deploy**. Si vous utilisez Google OAuth, ajoutez ensuite dans Google Cloud Console l'URI de redirection : `https://<votre-domaine-vercel>/api/auth/google/callback`.

## 4. Vérifications post-déploiement

- [ ] Page d'accueil accessible (HTTP 200).
- [ ] `/api/health` répond `{"ok":true}` (preuve de connexion à la base).
- [ ] Pages Services, Portfolio, Tarifs, Blog, Contact, Devis, Profil.
- [ ] Inscription + connexion membre, bouton Google (si configuré).
- [ ] Connexion admin (`/admin/login`), tableau de bord, journal d'activité.
- [ ] Manifest PWA (`/manifest.webmanifest`) et icônes (`/icons/*`).

## 5. Mises à jour suivantes

Chaque `git push` vers la branche `main` redéploie automatiquement le site. Ne jamais commiter `.env` ni secret. Pour revenir aux variables d'environnement après un changement de mot de passe via l'interface, supprimez la ligne `site_settings.admin_credentials` en base puis redéployez.

## Limites connues (honnêtes)

- Sans `DATABASE_URL` valide, le build Vercel échoue (`src/db/index.ts` l'exige au chargement) : c'est voulu, l'application ne peut pas fonctionner sans base.
- Le pool `pg` par défaut convient au trafic faible/moyen ; au-delà, gardez impérativement la connexion **pooled** Neon.
- Les e-mails transactionnels (notifications) ne sont pas configurés dans cette version.
