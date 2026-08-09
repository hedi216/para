# Analyse Stitch - POS LOLA

## Références analysées

- `C:\Users\marzo\Downloads\LOLA POS\POScode.html`
- `C:\Users\marzo\Downloads\LOLA POS\POSscreen.png`
- `C:\Users\marzo\Downloads\LOLA POS\POSDESIGN.md`
- `C:\Users\marzo\Downloads\DESIGN.md`

La capture Stitch représente une caisse de comptoir sur écran large. Le modèle visuel reste la référence : navigation sombre fixe, catalogue central clair, ticket persistant à droite. La capture prime sur les variantes de classes du HTML.

## Écran principal de caisse

| Zone | Contenu Stitch | Implémentation v1 |
| --- | --- | --- |
| Sidebar | Logo LOLA, `LOLA POS`, branche Sousse, navigation sombre | Sidebar React partagée avec liens fonctionnels et contraste renforcé. |
| Navigation | Point de vente, Commandes, Gestion stock, Recherche client | Routes `/pos`, `/pos/orders`, `/pos/stock`, `/pos/customers`, plus `/pos/invoices`. |
| Nouvelle transaction | Bouton en bas de sidebar | Remet le panier POS à zéro sans mouvement de stock. |
| Topbar caisse | Recherche / scan code-barres, notification, employé connecté, `Caisse 01` | Recherche produit, scan barcode et rattachement à l'employé authentifié. |
| Catalogue | Filtres catégories, cartes produits, stock visible, bouton `+` | Produits chargés depuis `/pos/products`, ajout bloqué si stock insuffisant. |
| Ticket | Client facultatif, lignes panier, remise fidélité, TVA 19 %, paiement espèces/carte | Vente finalisée via `/pos/sales`, ticket imprimable après encaissement. |

## Fonctionnalités extraites

### Recherche et scan code-barres

- Recherche par nom, marque, SKU et code-barres via `GET /pos/products?search=`.
- Scan direct via `GET /pos/products/barcode/:barcode`.
- Ajout immédiat au ticket après un scan réussi.
- Message clair si le code est absent ou si le stock est insuffisant.

### Catégories et cartes produit

Les filtres visibles restent `Tous`, `Visage`, `Solaire`, `Corps`, `Cheveux`. Chaque carte conserve image, marque, nom, prix en DT, stock visible et bouton d'ajout rapide.

### Panier caisse

Le ticket de droite conserve :

- `Associer un client` ;
- lignes avec image, suppression, quantité moins/plus et prix ;
- sous-total ;
- remise fidélité affichée à `0,000 DT` tant que le moteur fidélité n'est pas branché ;
- TVA 19 % incluse ;
- total ;
- paiement `Espèces` ou `Carte` ;
- action `Encaisser`.

### Ticket client imprimable

Après encaissement, le POS affiche `Imprimer ticket`. Le ticket imprimable contient LOLA Parapharmacie, Sousse, numéro ticket, date, caisse, employé, lignes produits, quantités, prix, sous-total, remise, TVA incluse, total et mode de paiement.

Important : ce ticket est un justificatif client POS simple. Ce n'est pas une facture fiscale officielle.

### Facture interne / proforma v1

L'écran `/pos/invoices` permet de convertir un ticket encaissé en facture interne/proforma v1. Le formulaire demande nom client ou société, téléphone, adresse, matricule fiscal optionnel et notes. La facture référence `PosSale` et recopie les lignes dans `InvoiceItem`.

La fiscalisation officielle devra être validée juridiquement et techniquement avant de présenter ce document comme facture légale.

### Gestion stock POS

L'écran `/pos/stock` permet de rechercher un produit, consulter stock actuel et seuil faible, puis ajuster le stock avec une quantité positive ou négative et un motif obligatoire. L'ajustement passe par `/pos/stock/adjust` et crée un `StockMovement`.

En v1, la route est accessible à `EMPLOYEE` et `ADMIN`. Des permissions fines devront distinguer consultation, ajustement et validation d'inventaire.

### Recherche client

L'écran `/pos/customers` recherche les clients par nom, téléphone ou email. Il affiche nom complet, téléphone, email et points fidélité. Le bouton `Sélectionner` prépare l'association future au ticket mais ne déclenche pas encore de remise réelle.

## Encaissement

`Encaisser` reste atomique : création de la vente, des lignes, du paiement, du ticket interne et des mouvements de stock dans une transaction backend. L'interface bloque le bouton pendant la requête et recharge le stock après succès.

## Contexte opérateur

La maquette affiche l'employé connecté et `Caisse 01`. En v1, chaque vente envoie `registerId: "CAISSE-01"` et le backend rattache la vente à l'utilisateur authentifié.

## Design system commun

Le POS utilise le même design system LOLA que le web et l'Admin :

- `primary #44664f`
- `primary-container #8fb399`
- `background #faf9f6`
- `secondary-container #e8e2d6`
- typographies `Libre Caslon Text` et `Manrope`

## Limites restantes

- Pas de mode offline.
- Pas d'intégration imprimante ticket native.
- Pas de fidélité réelle ni règles promotionnelles POS.
- Pas de retours avancés, avoirs, clôture caisse ou Z de caisse.
- Pas de fiscalisation officielle des factures.
- Les images produits restent celles du catalogue actuel.
