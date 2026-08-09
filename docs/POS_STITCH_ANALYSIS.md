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

L'écran `/pos/stock` permet de rechercher un produit, filtrer par catégorie, consulter image miniature, marque, catégorie, code-barres, SKU, prix, stock actuel et seuil faible, puis ajuster le stock avec une quantité positive ou négative et un motif obligatoire.

Les libellés visibles sont métier : `Ajouter du stock`, `Retirer du stock`, `Correction inventaire`, `Réception fournisseur`, `Perte / casse`, `Retour client`. Côté technique, ces actions restent des mouvements de stock traçables via `StockMovement`.

Le POS peut ajouter un produit simple via `/pos/products` avec nom, marque existante, catégorie existante, prix, ancien prix optionnel, code-barres, SKU, stock initial, seuil faible, image URL et description courte. Si l'employé crée le produit, la référence reste inactive (`isActive=false`) pour éviter une publication automatique sur le site web. Un admin doit valider/activer la fiche. Si un admin crée le produit, il peut être actif directement.

En v1, la gestion stock POS est accessible à `EMPLOYEE` et `ADMIN`. Des permissions fines devront distinguer consultation, ajustement, création produit et validation catalogue.

### Recherche client

L'écran `/pos/customers` recherche les clients par nom, téléphone ou email. Il centralise les clients créés en ligne (`CUSTOMER_SELF_SIGNUP`) et les clients ajoutés au comptoir (`POS_CREATED`).

Le formulaire `Nouveau client` demande prénom, nom, téléphone, e-mail optionnel, adresse, ville, date anniversaire optionnelle, consentement marketing email, consentement marketing SMS et notes. Le marketing, les campagnes et les avantages anniversaire ne sont pas implémentés en v1 ; seuls les champs sont préparés.

Le bouton `Sélectionner` prépare l'association future au ticket mais ne déclenche pas encore de remise réelle. L'association client au ticket sera connectée à l'étape fidélité.

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
- Pas de workflow catalogue `DRAFT` / `POS_ONLY` / `PUBLISHED` dédié.
- Les images produits restent celles du catalogue actuel ou les URL saisies.
