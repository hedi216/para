# Installation de developpement

## Prerequis

- Node.js 20 ou superieur
- npm 10 ou superieur
- PostgreSQL installe localement

## Base de donnees locale

Le projet utilise une installation PostgreSQL locale standard.

Configuration attendue :

| Parametre | Valeur |
| --- | --- |
| Base | `lola_parapharmacie` |
| Utilisateur | `para` |
| Mot de passe | `SMART` |
| Host | `localhost` |
| Port | `5432` |

Exemple SQL depuis un compte superutilisateur PostgreSQL :

```sql
CREATE USER para WITH PASSWORD 'SMART' CREATEDB;
CREATE DATABASE lola_parapharmacie OWNER para;
GRANT ALL PRIVILEGES ON DATABASE lola_parapharmacie TO para;
```

Si le role `para` existe deja sans droit de creation de base, ajoutez :

```sql
ALTER ROLE para CREATEDB;
```

Vous pouvez verifier la connexion avec :

```powershell
psql -h localhost -p 5432 -U para -d lola_parapharmacie
```

## Variables d'environnement

Copiez les modeles :

```powershell
Copy-Item .env.example .env
Copy-Item server\.env.example server\.env
```

Variables backend :

| Variable | Usage |
| --- | --- |
| `DATABASE_URL` | Connexion Prisma/PostgreSQL locale. |
| `JWT_SECRET` | Signature des tokens d'acces. |
| `PORT` | Port NestJS, `3000` par defaut. |
| `FRONTEND_ORIGIN` | Origine CORS du frontend local. |

`server/.env` attendu en developpement :

```env
DATABASE_URL="postgresql://para:SMART@localhost:5432/lola_parapharmacie?schema=public"
JWT_SECRET="change-this-long-random-secret-before-production"
PORT=3000
FRONTEND_ORIGIN="http://localhost:5173"
```

Variable frontend :

| Variable | Usage |
| --- | --- |
| `VITE_API_URL` | URL de l'API NestJS. |

## Prisma

Depuis `server/` :

```powershell
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Apres une modification de `prisma/schema.prisma`, creez une migration nommee, puis commitez le dossier genere `server/prisma/migrations/`. Ne commitez jamais `server/.env`, `node_modules` ou `dist`.

## Lancement

Terminal backend :

```powershell
cd server
npm run start:dev
```

Terminal frontend :

```powershell
npm run dev
```

## Verifications

```powershell
# Frontend, depuis la racine
npm run build

# Backend, depuis server/
npm run prisma:generate
npm run build
```

Pour verifier le parcours complet : connectez-vous avec `client@lola.tn`, creez une commande, puis connectez-vous avec `admin@lola.tn` et consultez les commandes et le stock. Une vente avec `employee@lola.tn` dans `/pos` doit modifier le meme inventaire.

## Production

- Utilisez un PostgreSQL manage et effectuez les migrations avec `npm run prisma:deploy`.
- Remplacez toutes les valeurs de demonstration, surtout `JWT_SECRET` et les mots de passe des comptes seedes.
- Definissez les origines CORS de `www.lola.tn`, `app.lola.tn` et `admin.lola.tn`.
- Placez les images produits dans un stockage objet ; la v1 conserve deja les URLs d'image dans PostgreSQL.
