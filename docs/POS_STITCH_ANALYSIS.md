# Analyse Stitch - POS LOLA

## Références analysées

- `C:\Users\marzo\Downloads\LOLA POS\POScode.html`
- `C:\Users\marzo\Downloads\LOLA POS\POSscreen.png`
- `C:\Users\marzo\Downloads\LOLA POS\POSDESIGN.md`
- `C:\Users\marzo\Downloads\DESIGN.md`

La capture et le HTML représentent une caisse de comptoir sur écran large. Le modèle visuel est très fonctionnel : navigation sombre fixe, zone catalogue centrale claire, ticket de caisse persistant à droite. La capture doit primer sur les classes `dark` présentes dans le HTML : elle montre une interface claire avec uniquement la barre latérale sombre.

## Écran principal de caisse

| Zone | Contenu Stitch | Conséquence produit |
| --- | --- | --- |
| Barre latérale | LOLA POS, agence Sousse, Point of Sale actif, bouton `New Transaction` | Une session de vente doit pouvoir être abandonnée ou réinitialisée sans altérer le stock. |
| Entête | Recherche, alerte, employée `Marie Dupont`, `Caisse 01` | La vente doit connaître le poste/caisse et l’employé connecté. |
| Catalogue | Filtres catégories, grille de produits, ajout rapide | Recherche et filtres ne doivent jamais quitter la vue de caisse. |
| Ticket | Client facultatif, lignes, quantités, suppression, totaux, paiement | Le panier de caisse est un brouillon, distinct de la vente finalisée. |

## Fonctionnalités extraites

### Recherche et scan code-barres

Le champ principal porte le libellé « Rechercher ou scanner un produit (Code-barres)... ». Il implique un endpoint optimisé pour :

- la recherche par nom, marque, SKU et code-barres ;
- une résolution directe quand un scanner USB saisit un code complet suivi d’Entrée ;
- le retour d’un message clair pour un code absent ou un article sans stock ;
- l’ajout immédiat au panier après un scan réussi, sans ouvrir une fiche produit.

### Catégories et cartes produit

Les filtres visibles sont `Tous`, `Visage`, `Solaire`, `Corps`, `Cheveux`. Chaque carte produit contient image, marque, nom, prix DT, bouton d’ajout et badge de stock (`Stock: 42`, `Stock: 3`). Le badge rouge constitue un signal de stock faible, non seulement une décoration.

À l’intégration, les catégories devront venir du même référentiel que le web. Les cartes devront recevoir le stock disponible pour la caisse sélectionnée, et désactiver l’ajout quand il est nul.

### Panier caisse

Le ticket de droite présente :

- une action `Associer un client` ;
- des lignes avec image, libellé, suppression, boutons moins/plus, quantité et prix ;
- le sous-total avec nombre d’articles ;
- une `Remise (Fidélité)` ;
- une TVA de 19 % incluse ;
- le total en DT ;
- les moyens `Espèces` et `Carte` ;
- l’action finale `Encaisser`.

La remise fidélité doit être calculée côté serveur à partir d’une règle versionnée. Elle ne doit pas être une simple valeur modifiable par le navigateur. Les prix et montants doivent être conservés en millimes TND (trois décimales) ou `Decimal` côté API/base.

### Encaissement

`Encaisser` doit être atomique : création de la vente, de ses lignes, du paiement, du ticket interne et des mouvements de stock dans une seule transaction. Un double clic ou une reprise réseau ne doit pas générer deux tickets. L’interface devra être verrouillée pendant la confirmation et afficher le numéro de ticket final.

### Contexte opérateur

La maquette affiche l’employée connectée et `Caisse 01`. En v1, une caisse est un registre attaché à un point de vente. Chaque vente doit donc enregistrer au minimum `storeId`, `registerId`, `employeeId` et l’horodatage.

## Menus présents et périmètre futur

| Menu | État dans Stitch | Périmètre cible |
| --- | --- | --- |
| Point of Sale | Écran détaillé | Vente, panier, paiement, ticket. |
| Orders | Lien de navigation | Historique, annulation contrôlée, retours. |
| Stock Management | Lien de navigation | Consultation, mouvements, réceptions et ajustements. |
| Customer Lookup | Lien de navigation | Recherche client, historique, fidélité et association au ticket. |

## Design system commun

POS utilise le même système LOLA que le web et l’Admin : `primary #44664f`, `primary-container #8fb399`, `background #faf9f6`, `secondary-container #e8e2d6`, avec `Libre Caslon Text` pour les titres et `Manrope` pour les données/actions. Pour ce contexte dense, les guides demandent surtout `body-md` et `label-sm`, des tableaux sobres et des marges de 24 à 40 px.

## Points à corriger lors de l’intégration

- Le HTML Stitch doit subir un audit d’encodage : des chaînes copiées peuvent présenter du mojibake selon la source/lecture.
- Les images et avatars sont des URLs externes Stitch ; il faudra les remplacer par des images produit administrées et un avatar neutre ou interne.
- Plusieurs textes restent anglais (`Point of Sale`, `Orders`, `Stock Management`, `Customer Lookup`, `New Transaction`, `Sousse Branch`) ; décider avec le client si l’outil devient 100 % français.
- Les produits, stocks, cliente, remise et montants visibles sont des données mockées.
- La règle de remise fidélité, la TVA applicable et le format de ticket ne sont pas encore des règles métier implémentées.
