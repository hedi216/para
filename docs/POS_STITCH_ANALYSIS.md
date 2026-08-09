# Analyse Stitch - POS LOLA

## Références analysées

- `C:\Users\marzo\Downloads\LOLA POS\POScode.html`
- `C:\Users\marzo\Downloads\LOLA POS\POSscreen.png`
- `C:\Users\marzo\Downloads\LOLA POS\POSDESIGN.md`
- `C:\Users\marzo\Downloads\DESIGN.md`

La capture et le HTML représentent une caisse de comptoir sur écran large. Le modèle visuel est fonctionnel et dense : navigation sombre fixe, zone catalogue centrale claire, ticket de caisse persistant à droite. La capture doit primer sur les classes `dark` présentes dans le HTML : elle montre une interface claire avec uniquement la barre latérale sombre.

## Écran principal de caisse

| Zone | Contenu Stitch | Conséquence produit |
| --- | --- | --- |
| Barre latérale | LOLA POS, branche Sousse, Point of Sale actif, bouton `New Transaction` | Une session de vente doit pouvoir être réinitialisée sans altérer le stock. |
| Entête | Recherche, alerte, employée connectée, `Caisse 01` | La vente doit connaître la caisse et l'employé connecté. |
| Catalogue | Filtres catégories, grille de produits, ajout rapide | Recherche et filtres doivent rester dans la vue de caisse. |
| Ticket | Client facultatif, lignes, quantités, suppression, totaux, paiement | Le panier de caisse reste un brouillon distinct de la vente finalisée. |

## Fonctionnalités extraites

### Recherche et scan code-barres

Le champ principal porte le libellé `Rechercher ou scanner un produit (Code-barres)...`. Il implique :

- recherche par nom, marque, SKU et code-barres via `GET /pos/products?search=`;
- résolution directe d'un code complet via `GET /pos/products/barcode/:barcode`;
- ajout immédiat au ticket après un scan réussi ;
- message clair si le code est absent ou si le stock est insuffisant.

### Catégories et cartes produit

Les filtres visibles sont `Tous`, `Visage`, `Solaire`, `Corps`, `Cheveux`. Chaque carte produit contient image, marque, nom, prix en DT, bouton `+` et badge de stock (`Stock: 42`, `Stock: 3`). Le badge rouge est un signal de stock faible.

### Panier caisse

Le ticket de droite présente :

- `Associer un client` ;
- lignes avec image, libellé, suppression, boutons moins/plus, quantité et prix ;
- sous-total avec nombre d'articles ;
- `Remise (Fidélité)` ;
- TVA 19 % incluse ;
- total en DT ;
- paiement `Espèces` ou `Carte` ;
- action finale `Encaisser`.

La remise fidélité reste affichée à `0,000 DT` tant que le moteur fidélité n'est pas implémenté côté backend.

### Encaissement

`Encaisser` doit rester atomique : création de la vente, de ses lignes, du paiement, du ticket interne et des mouvements de stock dans une seule transaction. L'interface est verrouillée pendant la requête et affiche le numéro de ticket final.

### Contexte opérateur

La maquette affiche l'employée connectée et `Caisse 01`. En v1, chaque vente envoie `registerId: "CAISSE-01"` et le backend rattache la vente à l'employé authentifié.

## Menus présents et périmètre futur

| Menu | État dans Stitch | Périmètre cible |
| --- | --- | --- |
| Point de vente | Écran détaillé intégré | Vente, panier, paiement, ticket. |
| Commandes | Lien visuel v1 | Historique, annulation contrôlée, retours. |
| Gestion stock | Lien visuel v1 | Consultation, mouvements, réceptions et ajustements. |
| Recherche client | Lien visuel v1 | Recherche client, historique, fidélité et association au ticket. |

## Décision d'intégration React

La page `/pos` utilise maintenant un layout dédié plein écran, sans `BackOfficeShell`, pour respecter la capture Stitch : barre latérale sombre fixe, entête scan/recherche, grille produits centrale et ticket persistant à droite sur desktop.

Sur mobile et tablette étroite, le ticket passe sous la grille pour éviter les chevauchements. Les menus secondaires sont conservés visuellement mais restent hors périmètre fonctionnel v1. `Nouvelle transaction` remet le panier POS à zéro sans modifier le stock.

## Design system commun

POS utilise le même système LOLA que le web et l'Admin : `primary #44664f`, `primary-container #8fb399`, `background #faf9f6`, `secondary-container #e8e2d6`, avec `Libre Caslon Text` pour les titres et `Manrope` pour les données/actions.

## Limites restantes

- Pas de mode offline.
- Pas d'imprimante ticket.
- Pas de recherche client complète.
- Pas de fidélité réelle.
- Pas de retours avancés ni clôture caisse.
- Les images produits restent celles du catalogue actuel.
