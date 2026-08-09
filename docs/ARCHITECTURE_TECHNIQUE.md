# Architecture technique

## Objectif

Construire progressivement un écosystème composé de trois espaces :

- `www.lola.tn` : e-commerce client
- `app.lola.tn` : POS/caisse employés
- `admin.lola.tn` : administration propriétaire

Ces trois espaces doivent partager le même backend et la même base de données pour garantir un stock unique.

## Frontend existant

Le frontend actuel est une base Vite + React + TypeScript + Tailwind CSS.

Recommandation :

- Conserver cette base pour `www.lola.tn`
- Ne pas refaire le design validé
- Extraire progressivement les appels données vers une couche API
- Remplacer les mocks de `src/data/catalog.ts` par des appels backend quand l'API catalogue sera prête

## Backend recommandé

Backend Node.js avec PostgreSQL et Prisma.

Deux options réalistes :

## Option A : Express

Avantages :

- Simple à démarrer
- Peu de structure imposée
- Rapide pour une petite API
- Très connu et facile à héberger

Limites :

- Peut devenir désorganisé si le projet grandit
- Nécessite de définir soi-même les conventions modules/services/controllers
- Moins adapté à un écosystème avec POS, admin, auth, stock, factures, rapports

## Option B : NestJS

Avantages :

- Architecture modulaire claire
- Très adapté aux domaines métier : catalogue, stock, commandes, POS, factures
- Injection de dépendances intégrée
- Guards et decorators utiles pour les rôles
- Bon cadre pour tests, validation, sécurité et maintenabilité

Limites :

- Plus lourd au démarrage
- Courbe d'apprentissage plus élevée
- Plus de conventions à respecter

## Recommandation

Recommander NestJS si le projet doit réellement couvrir e-commerce + POS + admin.

Raison : le domaine métier va devenir large et sensible. La gestion d'un stock unique, des rôles, des commandes, du POS, des retours, des factures et des rapports bénéficiera d'une structure stricte dès le backend.

Express reste acceptable uniquement si le client veut une première API très légère et rapide, avec un périmètre court terme limité au catalogue et commandes web.

## Base de données

PostgreSQL.

Raisons :

- Solide pour données transactionnelles
- Bon support des contraintes, transactions et index
- Adapté au stock, commandes, paiements, mouvements et rapports
- Compatible Prisma
- Facile à héberger sur Render, Railway, Supabase, Neon, AWS, etc.

## ORM

Prisma.

Raisons :

- Modèle de données lisible
- Migrations versionnées
- Type safety TypeScript
- Bonne productivité pour CRUD admin et API
- Transactions utiles pour commandes, ventes POS et mouvements de stock

## Authentification et rôles

Rôles cibles :

- `client` : compte e-commerce, panier, commandes
- `employee` : POS, consultation stock, vente magasin
- `admin` : gestion complète, rapports, employés, paramètres

Selon les réponses métier, ajouter des permissions fines :

- Modifier les prix
- Modifier le stock
- Annuler une vente
- Appliquer une remise
- Gérer les fournisseurs
- Voir les statistiques

Recommandation technique :

- Auth par email/mot de passe pour admin et employés
- Auth client par email/téléphone + mot de passe ou OTP selon préférence
- JWT access token + refresh token ou sessions sécurisées
- Journaliser les actions sensibles : prix, stock, remboursement, annulation

## API

Recommandation initiale : API REST.

Raisons :

- Simple pour e-commerce, POS et admin
- Facile à tester
- Facile à connecter au frontend actuel
- Compatible avec futures applications mobiles ou intégrations
- Moins complexe que GraphQL pour une première version

Exemples de modules :

- `/auth`
- `/catalog`
- `/products`
- `/categories`
- `/brands`
- `/inventory`
- `/orders`
- `/payments`
- `/deliveries`
- `/promotions`
- `/customers`
- `/employees`
- `/pos`
- `/returns`
- `/suppliers`
- `/purchases`
- `/invoices`
- `/reports`

## Stock unique

Le stock doit être modifié uniquement via des transactions backend.

Principe :

- Ne jamais modifier directement un nombre de stock sans créer un `stock_movement`
- Chaque mouvement doit avoir une cause : commande web, vente POS, retour, achat fournisseur, ajustement admin
- Le stock disponible est calculé ou maintenu à partir de l'inventaire et des mouvements

Points à décider :

- Réservation du stock pendant checkout
- Gestion stock par lot
- Gestion stock par point de vente
- Gestion stock disponible vs stock réservé

## Images produits

Options :

- Stockage local serveur pour prototype
- Stockage objet pour production : Cloudflare R2, S3, Supabase Storage ou équivalent

Recommandation :

- Utiliser un stockage objet en production
- Enregistrer en base uniquement les URLs, alt text, ordre d'affichage et image principale
- Prévoir compression et tailles optimisées pour le site

## Séparation future des espaces

Deux stratégies possibles :

## Stratégie 1 : monorepo frontend

```text
apps/
  web/
  pos/
  admin/
packages/
  ui/
  api-client/
  types/
```

Avantages :

- Partage types, composants, client API
- Cohérence design
- Meilleure maintenabilité long terme

## Stratégie 2 : dépôts séparés

Avantages :

- Isolation forte
- Déploiements indépendants

Limites :

- Duplication possible
- Coordination plus lourde

Recommandation :

Commencer avec une séparation progressive. Le projet actuel peut rester `web`. Quand le backend démarre et que `app`/`admin` commencent, migrer vers un monorepo si l'équipe veut maintenir les trois espaces ensemble.

## Déploiement futur

Architecture cible simple :

- Frontend `www.lola.tn` : Vercel, Netlify, Cloudflare Pages ou équivalent
- Frontend `app.lola.tn` : même plateforme frontend, accès restreint
- Frontend `admin.lola.tn` : même plateforme frontend, accès restreint
- Backend API : Render, Railway, Fly.io, VPS, AWS ou équivalent
- Base PostgreSQL managée : Neon, Supabase, Railway, Render ou cloud dédié
- Images : stockage objet
- Emails : service transactionnel
- Monitoring : logs serveur + alertes erreurs

## Sécurité

Points obligatoires avant production :

- HTTPS partout
- Hash mot de passe avec argon2 ou bcrypt
- Validation des entrées
- Permissions côté backend, pas seulement côté frontend
- Rate limiting sur auth et checkout
- Journalisation actions sensibles
- Backups automatiques PostgreSQL
- Migrations contrôlées
- Protection des endpoints admin/POS

## Décision à valider avant backend

Avant de créer l'API, valider :

- NestJS ou Express
- Stock par magasin ou global
- Lots et dates d'expiration
- Facturation officielle
- Paiement et livraison
- Remplacement ou non de la caisse actuelle
- Import initial des produits
