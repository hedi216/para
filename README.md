# LOLA Parapharmacie

Première version complète de l’écosystème LOLA : boutique e-commerce, caisse POS et administration. Les trois espaces utilisent une API NestJS et une base PostgreSQL communes afin que chaque commande confirmée ou vente finalisée modifie le même stock.

## Stack

- Web client, POS et administration : React 19, Vite, TypeScript, Tailwind CSS
- API : NestJS 11, JWT, `class-validator`
- Données : PostgreSQL et Prisma 6

## Démarrage local

### 1. Installer les dépendances

```powershell
npm install
Set-Location server
npm install
Set-Location ..
```

### 2. Démarrer PostgreSQL

Avec Docker Desktop :

```powershell
docker compose up -d postgres
```

Sinon, créez une base PostgreSQL nommée `lola_parapharmacie` avec un utilisateur `lola` / mot de passe `lola`, puis adaptez `server/.env`.

### 3. Configurer les variables d’environnement

```powershell
Copy-Item .env.example .env
Copy-Item server\.env.example server\.env
```

`server/.env` contient la connexion PostgreSQL et le secret JWT. Changez impérativement `JWT_SECRET` hors environnement local.

### 4. Créer le schéma et charger les données de démonstration

```powershell
Set-Location server
npm run prisma:migrate -- --name init
npm run prisma:seed
```

Le seed crée le magasin de Sousse, les catégories, marques, produits, inventaires, mouvements initiaux et les comptes de test.

### 5. Lancer l’application

Dans un premier terminal :

```powershell
Set-Location server
npm run start:dev
```

Dans un second terminal :

```powershell
npm run dev
```

Ouvrez `http://localhost:5173`.

## Espaces disponibles

| Espace | URL locale | Accès |
| --- | --- | --- |
| Boutique client | `http://localhost:5173/` | Public |
| Compte client | `http://localhost:5173/compte` | Client |
| Administration | `http://localhost:5173/admin` | Admin |
| Caisse POS | `http://localhost:5173/pos` | Employé ou admin |

## Comptes de test

| Rôle | E-mail | Mot de passe |
| --- | --- | --- |
| Administrateur | `admin@lola.tn` | `Admin123!` |
| Employé | `employee@lola.tn` | `Employee123!` |
| Client | `client@lola.tn` | `Client123!` |

Ces identifiants sont uniquement destinés au développement.

## Commandes utiles

```powershell
# Construire le frontend
npm run build

# Générer le client Prisma
Set-Location server
npm run prisma:generate

# Ouvrir l’interface Prisma locale
npx prisma studio

# Construire l’API
npm run build
```

La référence des routes se trouve dans [docs/API.md](docs/API.md) et l’installation détaillée dans [docs/DEV_SETUP.md](docs/DEV_SETUP.md).

## Limites v1

- Paiement en ligne présenté dans l’interface, mais non activé.
- Paiements POS saisis manuellement en espèces ou carte.
- Un seul magasin opérationnel, modèle de données prêt à recevoir d’autres points de vente.
- Pas de gestion opérationnelle des lots, dates d’expiration, retours ou fiscalisation officielle.
- Le POS requiert une connexion à l’API ; aucun mode hors ligne n’est implémenté.
