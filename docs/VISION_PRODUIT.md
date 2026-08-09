# Vision produit

LOLA Parapharmacie doit devenir un écosystème connecté autour d'un stock unique partagé. Les trois espaces ne sont pas trois applications isolées : ils doivent lire et écrire dans le même référentiel produits, stock, commandes, clients et factures.

## 1. www.lola.tn

Site e-commerce public pour les clients.

Objectif : vendre les produits de parapharmacie en ligne avec une expérience premium, claire et rassurante.

Fonctions cibles :

- Catalogue produits
- Recherche
- Filtres par catégorie, marque, besoin, prix, disponibilité
- Pages produit
- Panier
- Compte client
- Commandes
- Promotions
- Coupons
- Paiement à la livraison, carte bancaire si retenue, retrait magasin
- Suivi livraison/retrait
- Historique commandes
- Fidélité et avantages anniversaire si validés

## 2. app.lola.tn

Application POS/caisse pour les employés en magasin.

Objectif : encaisser les ventes physiques rapidement tout en mettant à jour le même stock que le site e-commerce.

Fonctions cibles :

- Recherche produit rapide
- Scan code-barres
- Panier caisse
- Remises contrôlées
- Encaissement
- Ticket ou facture
- Retour produit
- Consultation stock
- Consultation disponibilité web/magasin
- Identification client fidélité si utilisée
- Historique des ventes caisse

Point à challenger : si le POS remplace la caisse actuelle, il devient critique. Il faudra alors gérer imprimante ticket, scanner, caisse, droits employés, clôture de journée et continuité en cas de coupure Internet.

## 3. admin.lola.tn

Dashboard propriétaire/admin.

Objectif : piloter l'activité complète de LOLA depuis un seul espace.

Fonctions cibles :

- Gestion produits
- Gestion catégories et marques
- Gestion prix
- Gestion stock
- Ajustements de stock
- Commandes web
- Ventes POS
- Clients
- Employés et rôles
- Promotions et coupons
- Fournisseurs
- Achats et réceptions de stock
- Factures
- Retours
- Rapports et statistiques
- Export comptable ou Excel si nécessaire

## Partage des données

## Stock

Le stock doit être unique et transactionnel.

- Une commande web confirmée diminue ou réserve le stock.
- Une vente POS diminue le stock immédiatement.
- Une annulation, un retour ou une réception fournisseur crée un mouvement de stock inverse.
- L'admin voit le stock courant et l'historique des mouvements.

Décision à valider : le stock web doit-il être réservé au moment du panier, au moment de la validation de commande, ou seulement après confirmation par l'équipe ?

## Produits

Les produits sont communs aux trois espaces.

- Le site affiche les produits publiés.
- Le POS affiche les produits vendables en magasin.
- L'admin crée, modifie, désactive et enrichit les produits.

Certains produits peuvent être vendables en magasin mais non publiés sur le site.

## Commandes

Les commandes web et les ventes POS doivent être reliées au même modèle commercial.

- Commande web : panier client, livraison/retrait, paiement, statut.
- Vente POS : panier caisse, employé, moyen de paiement, ticket.
- L'admin consulte les deux flux et les agrège dans les rapports.

## Clients

Les clients peuvent venir du web ou du magasin.

- Web : compte client, coordonnées, historique commandes.
- POS : client optionnel pour vente rapide, client identifié pour fidélité.
- Admin : fiche client unifiée.

## Promotions

Les promotions doivent être centralisées.

- Le site applique les promotions visibles en ligne.
- Le POS peut appliquer les mêmes promotions ou un sous-ensemble.
- L'admin contrôle les dates, conditions et règles.

Point à challenger : les règles avancées peuvent devenir complexes rapidement. Il faut commencer simple sauf besoin métier clair.

## Factures

Les factures ou tickets doivent être cohérents entre web, POS et admin.

- Le site peut générer reçu, bon de commande ou facture selon obligation.
- Le POS peut imprimer ticket ou facture.
- L'admin archive et exporte les documents.

Décision à valider : faut-il générer des factures officielles conformes dès la première version ?

## Rapports

Les rapports doivent consolider les ventes web et magasin.

Exemples :

- Chiffre d'affaires par jour
- Ventes par canal : web, POS
- Produits les plus vendus
- Stock faible
- Marges si prix d'achat renseignés
- Performance promotions
- Retours et remboursements
- Clients actifs et fidélité
