# Analyse Stitch - Admin LOLA

## Références analysées

- `C:\Users\marzo\Downloads\LOLA ADMIN\ADMINcode.html`
- `C:\Users\marzo\Downloads\LOLA ADMIN\ADMINscreen.png`
- `C:\Users\marzo\Downloads\LOLA ADMIN\ADMINDESIGN.md`
- `C:\Users\marzo\Downloads\DESIGN.md`

La maquette est un dashboard de pilotage sur bureau : navigation verticale fine, en-tête avec filtre de date, indicateurs structurants, graphe de revenus, panneau d’alertes et tableau de commandes. Elle conserve l’élégance LOLA, mais privilégie nettement la lecture rapide et les données.

## Dashboard analytics

Le dashboard de référence s’ouvre sur « Bonjour, Voici les performances de LOLA aujourd’hui » et un sélecteur de date. Les données doivent donc être calculées sur une période explicite, avec un fuseau horaire Tunisie défini côté serveur.

### Indicateurs visibles

| Indicateur | Représentation Stitch | Donnée backend nécessaire |
| --- | --- | --- |
| Revenue Total | `3 260 DT`, tendance `+12.8 %` | CA net/brut de la période et comparaison avec la période précédente. |
| Canaux de Vente | Web 65 % / Magasin 35 % | Agrégation par origine de commande : `WEB` ou `POS`. |
| Panier Moyen | `74 DT` | CA des ventes retenues / nombre de ventes retenues. |
| Évolution des Revenus | Barres Lun à Auj | Séries temporelles quotidien/hebdomadaire selon le filtre. |

Le contrat doit préciser si les commandes annulées, retournées, non payées ou remboursées sont exclues. Pour v1, le dashboard doit ignorer les ventes annulées/voidées et distinguer clairement les remboursements.

## Alertes stock

Le panneau `Alertes Stock` affiche :

- `Rupture de Stock` avec nombre de produits et action `Gérer` ;
- `Stock Faible (< 5)` avec nombre de produits et action `Vérifier`.

Le seuil `< 5` est une valeur de démonstration. Le backend doit utiliser `reorderLevel` par produit et par point de vente, avec une valeur par défaut configurable, plutôt qu’une constante interface.

## Commandes récentes

Le tableau présente `ID Commande`, `Client`, `Canal`, `Total`, `Statut`. Les exemples montrent les canaux Web et Magasin ainsi que les statuts `En préparation`, `Livrée` et `Confirmée`.

L’Admin doit pouvoir lire une vue unifiée : une commande web et un ticket POS n’ont pas le même cycle de vie, mais doivent être exposés dans un format de ligne commun pour le reporting. Les actions de changement de statut restent spécifiques aux commandes web ; une vente caisse finalisée ne doit pas être modifiable comme une commande de livraison.

## Modules affichés comme futurs

| Module | Attente déduite |
| --- | --- |
| Analytics | Tableau de bord, périodes, séries et comparaisons. |
| Sales Reports | Exports et rapports par canal, produit, employé, caisse ou période. |
| CRM | Clients, historique, fidélité, adresse et consentements. |
| Inventory Admin | Produits, seuils, mouvements, ajustements et stocks par point de vente. |
| Staff Management | Employés, rôles, permissions, statut actif et caisses autorisées. |

## Design system commun

Admin partage le design system LOLA : `primary #44664f`, `primary-container #8fb399`, `background #faf9f6`, `secondary-container #e8e2d6`, `Libre Caslon Text` et `Manrope`. Les widgets administratifs doivent rester plats, blancs, bordés d’un trait sable ; les tableaux utilisent des lignes séparées plutôt qu’un zébrage. Les données denses privilégient `Manrope`, tandis que les titres et chiffres vedettes emploient `Libre Caslon Text`.

## Points à corriger lors de l’intégration

- Le HTML Stitch nécessite un audit d’encodage afin d’éliminer tout mojibake avant conversion React.
- Les images/avatar et éventuelles icônes externes ne doivent pas devenir des dépendances de production.
- Les libellés de navigation sont majoritairement anglais (`Analytics`, `Sales Reports`, `Inventory Admin`, `Staff Management`) ; confirmer une localisation 100 % française avant implémentation.
- Tous les montants, pourcentages, séries, alertes et commandes affichés sont mockés.
- Le graphe illustratif ne définit ni le fuseau, ni la formule de CA, ni le traitement des annulations/remboursements ; ces règles doivent vivre dans le backend et son contrat API.
