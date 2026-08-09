# Installation de développement

## Prérequis

- Node.js 20 ou supérieur
- npm 10 ou supérieur
- PostgreSQL 16 ou Docker Desktop

## Base de données locale

La solution la plus rapide est Docker :

```powershell
docker compose up -d postgres
```

Pour arrêter la base sans effacer les données :

```powershell
docker compose stop postgres
```

Pour supprimer aussi les données locales de démonstration :

```powershell
docker compose down -v
```

## Variables d’environnement

Copiez les modèles :

```powershell
Copy-Item .env.example .env
Copy-Item server\.env.example server\.env
```

Variables backend :

| Variable | Usage |
| --- | --- |
| `DATABASE_URL` | Connexion Prisma/PostgreSQL. |
| `JWT_SECRET` | Signature des tokens d’accès. |
| `PORT` | Port NestJS, `3000` par défaut. |
| `FRONTEND_ORIGIN` | Origine CORS du frontend local. |

Variable frontend :

| Variable | Usage |
| --- | --- |
| `VITE_API_URL` | URL de l’API NestJS. |

## Prisma

Depuis `server/` :

```powershell
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Après une modification de `prisma/schema.prisma`, créez une migration nommée, puis commitez le dossier généré `server/prisma/migrations/`. Ne commitez jamais `server/.env`, `node_modules` ou `dist`.

## Vérifications

```powershell
# Frontend, depuis la racine
npm run build

# Backend, depuis server/
npm run build
npm run prisma:generate
```

Pour vérifier le parcours complet : connectez-vous avec `client@lola.tn`, créez une commande, puis connectez-vous avec `admin@lola.tn` et consultez les commandes et le stock. Une vente avec `employee@lola.tn` dans `/pos` doit modifier le même inventaire.

## Production

- Utilisez un PostgreSQL managé et effectuez les migrations avec `npm run prisma:deploy`.
- Remplacez toutes les valeurs de démonstration, surtout `JWT_SECRET` et les mots de passe des comptes seedés.
- Définissez les origines CORS de `www.lola.tn`, `app.lola.tn` et `admin.lola.tn`.
- Placez les images produits dans un stockage objet ; la v1 conserve déjà les URLs d’image dans PostgreSQL.
