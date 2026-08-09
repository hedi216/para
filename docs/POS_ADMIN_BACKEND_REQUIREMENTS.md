# Besoins backend - POS et Admin

## Invariant central : stock unique

Le web, le POS et l’Admin consultent le même inventaire. Une commande web confirmée, une vente caisse finalisée, un retour ou un ajustement créent un `StockMovement` dans une transaction unique. La quantité ne doit jamais devenir négative, même avec deux opérations concurrentes.

La v1 fonctionne avec un seul magasin ; les objets conservent cependant `storeId` afin d’ajouter des points de vente sans réécrire les ventes ou le stock.

## Catalogue exploitable partout

Les produits doivent exposer : identifiant, slug, catégorie, marque, prix TND, ancien prix éventuel, SKU, code-barres unique éventuel, image, statut actif et stock disponible.

Les accès POS doivent supporter :

- recherche texte par nom, marque et SKU ;
- filtre catégorie ;
- résolution stricte par code-barres ;
- retour du stock de la caisse/point de vente courant ;
- réponse rapide pour le scan et l’ajout panier.

## Inventaire et alertes

| Besoin | Objets et règles |
| --- | --- |
| Stock actuel | `InventoryItem(productId, storeId, quantity, reserved, reorderLevel)`. |
| Traçabilité | `StockMovement` signé : initialisation, ajustement, commande web, vente POS, retour. |
| Rupture | Alerte quand `availableQuantity <= 0`. |
| Stock faible | Alerte quand `availableQuantity <= reorderLevel`. |
| Ajustement | Motif, employé responsable, avant/après et référence obligatoire. |

La réservation de stock reste optionnelle pour les paniers v1. Le stock est décrémenté au moment métier convenu : confirmation d’une commande web ou finalisation POS.

## Ventes POS et caisses

Le POS exige les entités suivantes :

- `CashRegister` : code (`CAISSE-01`), magasin, actif/inactif, ouverture et fermeture future ;
- `PosSale` : numéro de ticket, magasin, caisse, employé, client optionnel, statut, montants, date ;
- `PosSaleItem` : produit, libellé et prix figés, quantité, remise de ligne éventuelle, total de ligne ;
- `PosPayment` : espèces ou carte, montant, statut, référence carte éventuelle ;
- `StockMovement` relié à la vente ;
- `PosRefund` ou vente inverse : motif, opérateur, lignes retournées, paiement associé et remise en stock contrôlée.

Une vente finalisée doit être idempotente. Le client peut être absent. S’il est associé, le serveur renvoie ses points/avantages applicables et calcule la remise fidélité ; le poste ne décide jamais seul de la valeur de la remise.

## Commandes web et magasin

Les commandes web gardent leur entité `Order` et leur cycle (`CONFIRMED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `COMPLETED`, `CANCELLED`). Une vente POS est immédiatement finalisée et ne doit pas emprunter ce même workflow.

Pour les tableaux Admin, l’API peut fournir une projection `SalesDocument` unifiée avec : numéro, canal `WEB | STORE`, client, total, statut, date et lien vers l’objet source.

## TVA, remises et montants

- Tous les prix sont stockés en `Decimal(10,3)` TND ou millimes entiers, jamais en `float`.
- La TVA de 19 % vue dans Stitch doit être configurée côté serveur. Le ticket indique explicitement si elle est incluse.
- Les remises fidélité doivent enregistrer la règle, le montant et l’identifiant du programme appliqué.
- Les totaux conservent sous-total, remise, TVA, frais éventuels et total final comme snapshots.

## Dashboard et rapports

Le backend Admin doit accepter une période et un fuseau, puis fournir :

- revenus par jour/semaine/mois ;
- comparaison avec la période précédente ;
- répartition Web/Magasin en montant et pourcentage ;
- panier moyen ;
- nombre de commandes/ventes ;
- alertes rupture et stock faible ;
- commandes récentes avec canal et statut.

Les agrégats doivent être calculés sur les documents retenus par la règle métier, en excluant a minima annulations, tickets voidés et remboursements selon leur état.

## CRM, employés et permissions

Le CRM nécessite profil client, contacts, adresses, historique web/POS, fidélité et consentements futurs. La gestion équipe nécessite `EmployeeProfile`, statut actif, caisse/magasin autorisés et permissions granulaire.

| Permission indicative | CUSTOMER | EMPLOYEE | ADMIN |
| --- | --- | --- | --- |
| Commander sur le web | Oui | Non | Non |
| Encaisser sur POS | Non | Oui | Oui |
| Associer/rechercher un client | Non | Oui | Oui |
| Ajuster le stock | Non | Selon permission | Oui |
| Modifier prix/produits | Non | Non | Oui |
| Lire les rapports globaux | Non | Selon permission | Oui |
| Gérer les employés | Non | Non | Oui |

Le rôle est un point de départ. Les permissions doivent être vérifiées côté API, jamais seulement masquées dans le frontend.
