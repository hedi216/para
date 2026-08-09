# Modèle de données draft

Ce document propose un premier modèle conceptuel. Il n'est pas encore un schéma Prisma définitif. Il doit être validé après les réponses métier.

## users

Compte d'authentification commun.

Rôle :

- Identifiants de connexion
- Email, téléphone, mot de passe hashé
- Statut actif/inactif
- Lien vers client ou employé selon le profil

## roles

Rôles et permissions.

Rôle :

- Distinguer client, employé, admin
- Préparer des permissions fines
- Contrôler l'accès au POS et à l'admin

## customers

Fiches clients.

Rôle :

- Informations personnelles client
- Coordonnées livraison
- Historique commandes
- Fidélité
- Avantage anniversaire si retenu

## employees

Fiches employés.

Rôle :

- Relier un utilisateur à un profil employé
- Gérer poste, permissions, statut
- Associer les ventes POS et actions admin à un employé

## products

Catalogue produit central.

Rôle :

- Nom, description, référence interne
- Code-barres principal
- Prix vente
- Prix achat si suivi de marge
- Statut publié web
- Statut vendable POS
- Marque et catégorie

## categories

Organisation du catalogue.

Rôle :

- Catégories web et admin
- Hiérarchie possible : parent/enfant
- Ordre d'affichage
- Publication ou masquage

## brands

Marques partenaires.

Rôle :

- Nom de marque
- Logo éventuel
- Description
- Page marque future

## product_images

Images des produits.

Rôle :

- URL image
- Texte alternatif
- Image principale
- Ordre d'affichage

## inventory

Etat de stock courant.

Rôle :

- Quantité disponible
- Quantité réservée si nécessaire
- Seuil stock faible
- Localisation si plusieurs points de vente ou dépôt

Point à valider : si les lots et dates d'expiration sont nécessaires, il faudra probablement ajouter une entité `inventory_batches`.

## stock_movements

Historique immuable des mouvements de stock.

Rôle :

- Entrée fournisseur
- Vente web
- Vente POS
- Retour
- Annulation
- Ajustement admin
- Casse/perte

Chaque mouvement doit conserver la cause, la quantité, l'utilisateur et la date.

## carts

Paniers clients web.

Rôle :

- Panier actif d'un client ou visiteur
- Lignes panier
- Préparation checkout

Selon la stratégie retenue, le panier peut ne pas réserver le stock.

## orders

Commandes web.

Rôle :

- Numéro de commande
- Client
- Statut : brouillon, confirmé, préparé, expédié, livré, annulé
- Mode livraison ou retrait
- Total
- Canal web

## order_items

Lignes de commande.

Rôle :

- Produit commandé
- Quantité
- Prix unitaire au moment de l'achat
- Remise appliquée
- TVA si utilisée

Important : le prix doit être copié dans la ligne, pas seulement lié au produit, pour garder l'historique.

## payments

Paiements.

Rôle :

- Moyen de paiement
- Montant
- Statut : en attente, payé, échoué, remboursé
- Référence transaction si carte bancaire
- Paiement à la livraison si utilisé

## deliveries

Livraisons et retraits.

Rôle :

- Adresse de livraison
- Zone
- Frais livraison
- Transporteur/livreur
- Statut livraison
- Date estimée et date réelle

## promotions

Règles promotionnelles.

Rôle :

- Prix promo
- Pourcentage
- Montant fixe
- Période de validité
- Application par produit, catégorie, marque ou panier

Point à valider : commencer simple ou supporter des règles avancées dès le départ.

## coupons

Codes promotionnels.

Rôle :

- Code saisi par client ou employé
- Réduction
- Limites d'utilisation
- Date de validité
- Conditions de panier

## loyalty

Programme fidélité.

Rôle :

- Points client
- Historique gains/utilisations
- Avantages
- Anniversaire si validé

Cette partie doit rester optionnelle tant que la stratégie fidélité n'est pas claire.

## suppliers

Fournisseurs.

Rôle :

- Coordonnées fournisseur
- Produits associés
- Conditions éventuelles
- Historique achats

## purchases

Achats et réceptions fournisseur.

Rôle :

- Bon d'achat
- Fournisseur
- Produits reçus
- Quantités
- Prix d'achat
- Mise à jour stock via `stock_movements`

## invoices

Factures, reçus ou tickets.

Rôle :

- Document lié à une commande web ou vente POS
- Numéro
- Montants
- TVA si utilisée
- Statut
- PDF ou référence document

Point à valider : niveau officiel/comptable attendu.

## pos_sales

Ventes caisse.

Rôle :

- Vente magasin
- Employé
- Lignes produits
- Paiement
- Ticket
- Mouvement de stock immédiat

Peut partager une structure proche de `orders`, mais il est utile de garder le canal POS clairement identifiable.

## returns

Retours produit.

Rôle :

- Retour lié à une commande web ou vente POS
- Produit et quantité retournés
- Motif
- Etat produit
- Remboursement ou avoir
- Mouvement de stock si le produit revient en stock

## Relations importantes

- Un `user` peut être lié à un `customer` ou un `employee`.
- Un `product` appartient à une `category` et une `brand`.
- Un `product` a plusieurs `product_images`.
- Un `product` a un état `inventory`.
- Toute modification de stock doit créer un `stock_movement`.
- Une `order` a plusieurs `order_items`.
- Une `pos_sale` a plusieurs lignes de vente et crée des `stock_movements`.
- Une `invoice` peut être liée à une `order` ou une `pos_sale`.
- Un `return` peut recréer du stock via `stock_movements`.

## Questions qui peuvent changer le modèle

- Gestion multi-magasins
- Lots et dates d'expiration
- TVA et facture officielle
- Fidélité avancée
- Promotions avancées
- POS offline
- Commandes WhatsApp/Facebook

## Alignement v1 ajoute

Le schema Prisma v1 ajoute explicitement :

- `CashRegister` pour identifier les caisses physiques, par exemple `CAISSE-01`.
- `PosSale.registerId` pour relier chaque ticket POS a une caisse.
- `Order.idempotencyKey` pour eviter une double commande web lors d'un retry.
- `PosSale.idempotencyKey` pour eviter un double ticket POS lors d'un retry.
- `PosSale.customerId` pointe vers `CustomerProfile.id`, pas vers `User.id`, afin de separer authentification et profil client/fidelite.
