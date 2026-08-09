# Besoins backend - POS et Admin

## Invariant central : stock unique

Le web, le POS et l'Admin consultent le meme inventaire. Une commande web confirmee, une vente caisse finalisee, un retour ou un ajustement creent un `StockMovement` dans une transaction unique. La quantite ne doit jamais devenir negative, meme avec deux operations concurrentes.

La v1 fonctionne avec un seul magasin ; les objets conservent `storeId` afin d'ajouter des points de vente sans reecrire les ventes ou le stock.

## Catalogue exploitable partout

Les produits doivent exposer : identifiant, slug, categorie, marque, prix TND, ancien prix eventuel, SKU, code-barres unique, image, statut actif et stock disponible.

Les acces POS doivent supporter :

- recherche texte par nom, marque, SKU et code-barres ;
- filtre categorie ;
- resolution stricte par code-barres via `GET /pos/products/barcode/:barcode` ;
- retour du stock du point de vente courant ;
- reponse rapide pour le scan et l'ajout panier.

## Inventaire et alertes

| Besoin | Objets et regles |
| --- | --- |
| Stock actuel | `InventoryItem(productId, storeId, quantity, reserved, reorderLevel)`. |
| Tracabilite | `StockMovement` signe : initialisation, ajustement, commande web, vente POS, retour. |
| Rupture | Alerte quand `availableQuantity <= 0`. |
| Stock faible | Alerte quand `availableQuantity <= reorderLevel` ou seuil v1 de 5 pieces. |
| Ajustement | Motif, employe responsable, avant/apres et reference. |

La reservation de stock reste optionnelle pour les paniers v1. Le stock est decremente au moment metier convenu : confirmation d'une commande web ou finalisation POS.

## Ventes POS et caisses

Le POS exige les entites suivantes :

- `CashRegister` : code (`CAISSE-01`), magasin, actif/inactif, ouverture et fermeture future ;
- `PosSale` : numero de ticket, magasin, caisse, employe, client optionnel, statut, montants, date ;
- `PosSaleItem` : produit, libelle et prix figes, quantite, total de ligne ;
- `Payment` rattache a `posSaleId` : especes ou carte, montant, statut, reference eventuelle ;
- `StockMovement` relie a la vente ;
- module retour futur pour remplacer le remboursement simple v1.

Une vente finalisee doit etre idempotente avec `idempotencyKey`. Le client peut etre absent. S'il est associe, `customerId` correspond a `CustomerProfile.id`, pas a `User.id`, afin de relier la vente au profil client/fidelite.

## Commandes web et magasin

Les commandes web gardent leur entite `Order` et leur cycle (`CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `COMPLETED`, `CANCELLED`). Une vente POS est immediatement finalisee et ne doit pas emprunter ce meme workflow.

Pour les tableaux Admin, l'API peut fournir une projection unifiee avec : numero, canal `WEB | STORE`, client ou employe, total, statut, date et lien vers l'objet source.

## TVA, remises et montants

- Tous les prix sont stockes en `Decimal(10,3)` TND ou millimes entiers, jamais en `float`.
- La TVA de 19 % vue dans Stitch doit etre configuree cote serveur lors de l'integration finale.
- Les remises fidelite doivent enregistrer la regle, le montant et l'identifiant du programme applique.
- Les totaux conservent sous-total, remise, TVA, frais eventuels et total final comme snapshots.

## Dashboard et rapports

`GET /admin/dashboard` v1 fournit deja :

- revenu total web + magasin ;
- repartition Web/Magasin en montant, nombre et pourcentage ;
- panier moyen ;
- alertes rupture et stock faible ;
- commandes web et ventes POS recentes dans une activite unifiee.

Les prochains rapports devront ajouter periode, fuseau horaire, comparaison avec periode precedente, export et series par jour/semaine/mois.

## CRM, employes et permissions

Le CRM necessite profil client, contacts, adresses, historique web/POS, fidelite et consentements futurs. La gestion equipe necessite `EmployeeProfile`, statut actif, caisse/magasin autorises et permissions granulaires.

| Permission indicative | CUSTOMER | EMPLOYEE | ADMIN |
| --- | --- | --- | --- |
| Commander sur le web | Oui | Non | Non |
| Encaisser sur POS | Non | Oui | Oui |
| Associer/rechercher un client | Non | Oui | Oui |
| Ajuster le stock | Non | Selon permission | Oui |
| Modifier prix/produits | Non | Non | Oui |
| Lire les rapports globaux | Non | Selon permission | Oui |
| Gerer les employes | Non | Non | Oui |

Le role est un point de depart. Les permissions doivent etre verifiees cote API, jamais seulement masquees dans le frontend.

## Decisions v1 appliquees

- Une caisse `CashRegister` existe pour le magasin par defaut, avec le code `CAISSE-01`.
- Chaque vente POS enregistre `registerId`.
- `POST /orders` et `POST /pos/sales` acceptent `idempotencyKey`.
- `GET /pos/products/barcode/:barcode` existe pour le scan.
- `POST /pos/sales/:id/refund` existe en version simple : remise en stock, paiement rembourse, vente `VOIDED`.
- Le dashboard admin agrege commandes web, ventes POS et alertes stock.
