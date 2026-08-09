# Roadmap

La roadmap proposée avance par validation métier progressive. Le point central est de ne pas développer le POS ou l'admin complet avant d'avoir sécurisé le modèle stock/commandes.

## Phase 1 : finaliser le frontend e-commerce

Objectif : stabiliser `www.lola.tn` avant connexion backend.

Travaux :

- Finaliser pages publiques : accueil, catalogue, produit, panier
- Ajouter responsive QA mobile
- Préparer états UI : chargement, vide, erreur, rupture stock
- Préparer couche API côté frontend
- Remplacer progressivement les mocks par des services
- Garder le design Stitch validé

Livrable :

- Frontend public prêt à consommer l'API catalogue

## Phase 2 : backend catalogue, produits, stock

Objectif : créer la première API réelle.

Travaux :

- Initialiser backend Node.js, idéalement NestJS
- Configurer PostgreSQL et Prisma
- Modéliser catégories, marques, produits, images
- Modéliser inventory et stock_movements
- Créer API catalogue publique
- Créer API admin minimale pour produits et stock
- Import initial Excel si disponible

Livrable :

- Catalogue réel connecté au frontend
- Stock unique côté backend

## Phase 3 : commandes client et checkout

Objectif : permettre aux clients de commander.

Travaux :

- Panier persistant
- Compte client ou checkout invité selon décision
- Création commande
- Adresse livraison/retrait
- Frais livraison
- Paiement à la livraison et autres moyens validés
- Statuts commande
- Emails ou notifications de confirmation
- Décrément/réservation stock selon règle validée

Livrable :

- Parcours commande web utilisable

## Phase 4 : admin produits, stock et commandes

Objectif : donner au propriétaire un outil de gestion opérationnel.

Travaux :

- Auth admin
- Liste et édition produits
- Gestion prix, publication web, stock
- Consultation mouvements de stock
- Consultation commandes
- Mise à jour statuts commande
- Ajustements stock contrôlés
- Gestion clients simple

Livrable :

- Admin MVP pour gérer le site e-commerce

## Phase 5 : POS employés

Objectif : connecter les ventes magasin au stock unique.

Travaux :

- Auth employés
- Recherche produit rapide
- Scan code-barres
- Panier caisse
- Encaissement
- Ticket/facture selon décision
- Retours simples
- Historique ventes POS
- Droits employés
- Décrément stock transactionnel

Livrable :

- Première version caisse magasin

Point critique : si le POS remplace la caisse existante, prévoir une phase pilote en magasin avant généralisation.

## Phase 6 : promotions, fidélité, anniversaires

Objectif : augmenter les ventes et la rétention client.

Travaux :

- Promotions simples
- Coupons
- Règles par produit, catégorie ou marque
- Fidélité si validée
- Avantage anniversaire si validé
- Application cohérente web et POS

Livrable :

- Moteur commercial centralisé

## Phase 7 : fournisseurs, achats, factures

Objectif : structurer l'exploitation magasin.

Travaux :

- Gestion fournisseurs
- Bons d'achat
- Réceptions stock
- Prix d'achat
- Marges
- Factures ou documents officiels selon besoin
- Retours fournisseur si nécessaire

Livrable :

- Cycle achat/stock plus complet

## Phase 8 : statistiques, sécurité, déploiement

Objectif : préparer la production durable.

Travaux :

- Rapports ventes web/POS
- Produits les plus vendus
- Alertes stock faible
- Alertes expiration si lots gérés
- Exports Excel
- Durcissement sécurité
- Sauvegardes
- Monitoring
- Déploiement `www.lola.tn`, `app.lola.tn`, `admin.lola.tn`
- Documentation exploitation

Livrable :

- Ecosystème prêt pour exploitation réelle

## Décisions à obtenir avant Phase 2

- NestJS ou Express
- Stock global ou multi-emplacements
- Lots et dates d'expiration
- Factures officielles ou tickets simples
- Modes de paiement
- Zones et règles de livraison
- Import Excel disponible ou non
- Codes-barres disponibles ou non
- POS critique dès le lancement ou plus tard
