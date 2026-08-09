# LOLA Parapharmacie

Premiere version complete de l'ecosysteme LOLA : boutique e-commerce, caisse POS et administration. Les trois espaces utilisent une API NestJS et une base PostgreSQL communes afin que chaque commande confirmee ou vente finalisee modifie le meme stock.

## Stack

- Web client, POS et administration : React 19, Vite, TypeScript, Tailwind CSS
- API : NestJS 11, JWT, `class-validator`
- Donnees : PostgreSQL local et Prisma 6

## Demarrage local

### 1. Installer PostgreSQL

Installez PostgreSQL normalement sur la machine, avec un serveur accessible sur `localhost:5432`.

Configuration locale attendue :

| Parametre | Valeur |
| --- | --- |
| Base | `lola_parapharmacie` |
| Utilisateur | `para` |
| Mot de passe | `SMART` |
| Host | `localhost` |
| Port | `5432` |

Exemple SQL a executer avec `psql` depuis un compte superutilisateur PostgreSQL :

```sql
CREATE USER para WITH PASSWORD 'SMART';
CREATE DATABASE lola_parapharmacie OWNER para;
GRANT ALL PRIVILEGES ON DATABASE lola_parapharmacie TO para;
```

### 2. Installer les dependances

```powershell
npm install
cd server
npm install
```

### 3. Configurer les variables d'environnement

Depuis la racine du projet :

```powershell
Copy-Item .env.example .env
Copy-Item server\.env.example server\.env
```

`server/.env` doit contenir :

```env
DATABASE_URL="postgresql://para:SMART@localhost:5432/lola_parapharmacie?schema=public"
JWT_SECRET="change-this-long-random-secret-before-production"
PORT=3000
FRONTEND_ORIGIN="http://localhost:5173"
```

Changez imperativement `JWT_SECRET` hors environnement local.

### 4. Creer le schema et charger les donnees initiales

```powershell
cd server
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run start:dev
```

Le seed cree le magasin de Sousse, la caisse par defaut, les categories, marques, produits, inventaires, mouvements initiaux et les comptes de test.

### 5. Lancer le frontend

Dans un autre terminal, depuis la racine du projet :

```powershell
npm install
npm run dev
```

Ouvrez `http://localhost:5173`.

## Espaces disponibles

| Espace | URL locale | Acces |
| --- | --- | --- |
| Boutique client | `http://localhost:5173/` | Public |
| Compte client | `http://localhost:5173/compte` | Client |
| Administration | `http://localhost:5173/admin` | Admin |
| Caisse POS | `http://localhost:5173/pos` | Employe ou admin |

Les pages POS et Admin actuelles sont des MVP temporaires. Les maquettes Stitch POS/Admin validees seront integrees plus tard sans changer la direction design.

## Comptes de test

| Role | E-mail | Mot de passe |
| --- | --- | --- |
| Administrateur | `admin@lola.tn` | `Admin123!` |
| Employe | `employee@lola.tn` | `Employee123!` |
| Client | `client@lola.tn` | `Client123!` |

Ces identifiants sont uniquement destines au developpement.

## Commandes utiles

```powershell
# Construire le frontend
npm run build

# Generer le client Prisma
cd server
npm run prisma:generate

# Ouvrir l'interface Prisma locale
npx prisma studio

# Construire l'API
npm run build
```

La reference des routes se trouve dans [docs/API.md](docs/API.md) et l'installation detaillee dans [docs/DEV_SETUP.md](docs/DEV_SETUP.md).

## Limites v1

- Paiement en ligne presente dans l'interface, mais non active.
- Paiements POS saisis manuellement en especes ou carte.
- Un seul magasin operationnel, modele de donnees pret a recevoir d'autres points de vente.
- POS et Admin React sont des ecrans MVP temporaires avant integration visuelle exacte des maquettes Stitch.
- Pas de gestion operationnelle des lots, dates d'expiration, retours avances ou fiscalisation officielle.
- Le POS requiert une connexion a l'API ; aucun mode hors ligne n'est implemente.
