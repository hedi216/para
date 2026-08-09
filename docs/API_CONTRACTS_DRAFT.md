# Contrats API draft - web, POS et Admin

Base API locale : `http://localhost:3000`. Base cible production : `https://api.lola.tn`.

Les corps sont JSON, les montants TND sont des nombres a trois decimales, et les routes protegees utilisent `Authorization: Bearer <token>`.

## Etat d'implementation v1

Deja implemente :

- Catalogue public : `GET /products`, `GET /products/:id`, `GET /categories`, `GET /brands`.
- Auth : `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- Commandes web : `POST /orders`, `GET /orders/my-orders`.
- POS : `GET /pos/categories`, `GET /pos/brands`, `GET /pos/products`, `GET /pos/products/barcode/:barcode`, `POST /pos/products`, `POST /pos/sales`, `GET /pos/sales`, `GET /pos/sales/:id`, `POST /pos/sales/:id/refund`, `GET /pos/stock`, `POST /pos/stock/adjust`, `GET /pos/customers`, `POST /pos/customers`, `POST /pos/invoices`, `GET /pos/invoices`, `GET /pos/invoices/:id`.
- Admin : `GET /admin/dashboard`, `GET /admin/products`, `POST /admin/products`, `PATCH /admin/products/:id`, `GET /admin/orders`, `PATCH /admin/orders/:id/status`, `GET /admin/inventory`, `POST /admin/inventory/adjust`, `GET /admin/clients`.

Encore futur :

- `GET /admin/staff`
- `POST /auth/logout` avec revocation serveur
- pagination/filtres avances sur plusieurs listes
- module retours complet, fidelite complete, fiscalisation officielle et TVA configurable
- workflow admin de validation catalogue plus fin qu'un simple `isActive`

## Conventions

- `storeId` est deduit du magasin par defaut en v1.
- `registerId` sur le POS accepte l'identifiant technique `CashRegister.id` ou le code de caisse, par exemple `CAISSE-01`. Sans valeur, l'API utilise la caisse par defaut.
- `customerId` sur `POST /pos/sales` correspond a `CustomerProfile.id`, pas a `User.id`. Le POS vend a un profil client/fidelite optionnel, tandis que `User.id` reste reserve a l'authentification.
- `idempotencyKey` est acceptee par `POST /orders` et `POST /pos/sales` pour eviter les doubles creations en cas de retry reseau.
- `channel` vaut `WEB` ou `STORE`.

## Public web

| Methode | Route | Statut | Description |
| --- | --- | --- | --- |
| `GET` | `/products` | Implemente | Produits actifs. Filtres actuels : `search`, `category`. |
| `GET` | `/products/:id` | Implemente | Produit par identifiant ou slug. |
| `GET` | `/categories` | Implemente | Categories actives. |
| `GET` | `/brands` | Implemente | Marques partenaires. |
| `POST` | `/orders` | Implemente | Commande confirmee, paiement v1 et stock decremente. |

Exemple `POST /orders` :

```json
{
  "idempotencyKey": "web-order-uuid",
  "items": [{ "productId": "lrp-micellaire-ultra", "quantity": 1 }],
  "paymentMethod": "CASH_ON_DELIVERY",
  "recipientName": "Amira Ben Ali",
  "recipientPhone": "22123456",
  "deliveryAddress": "Sousse",
  "deliveryCity": "Sousse"
}
```

## POS

Toutes les routes POS demandent `EMPLOYEE` ou `ADMIN`.

| Methode | Route | Statut | Description |
| --- | --- | --- | --- |
| `GET` | `/pos/categories` | Implemente | Categories actives pour les formulaires POS. |
| `GET` | `/pos/brands` | Implemente | Marques existantes pour les formulaires POS. |
| `GET` | `/pos/products?search=` | Implemente | Recherche nom, marque, SKU ou code-barres. |
| `GET` | `/pos/products/barcode/:barcode` | Implemente | Produit actif exact par code-barres. |
| `POST` | `/pos/products` | Implemente | Creation produit comptoir avec stock initial et validation admin recommandee. |
| `POST` | `/pos/sales` | Implemente | Vente caisse, paiement manuel, caisse, mouvements de stock. |
| `GET` | `/pos/sales` | Implemente | 100 dernieres ventes caisse. |
| `GET` | `/pos/sales/:id` | Implemente | Detail complet d'un ticket POS. |
| `POST` | `/pos/sales/:id/refund` | Implemente simple | Restitue le stock, cree un paiement rembourse et marque la vente `VOIDED`. |
| `GET` | `/pos/stock?search=` | Implemente | Inventaire POS par produit, marque, SKU ou code-barres. |
| `POST` | `/pos/stock/adjust` | Implemente | Ajustement stock avec motif obligatoire et mouvement trace. |
| `GET` | `/pos/customers?search=` | Implemente | Recherche client pour association/fidelite future. |
| `POST` | `/pos/customers` | Implemente | Creation client comptoir avec consentements marketing prepares. |
| `POST` | `/pos/invoices` | Implemente | Cree une facture interne/proforma v1 depuis un ticket POS. |
| `GET` | `/pos/invoices` | Implemente | Liste les factures internes POS. |
| `GET` | `/pos/invoices/:id` | Implemente | Detail facture interne POS. |

Exemple `POST /pos/sales` :

```json
{
  "idempotencyKey": "pos-sale-uuid",
  "registerId": "CAISSE-01",
  "customerId": "customerProfileId_optional",
  "paymentMethod": "CASH",
  "items": [{ "productId": "bioderma-photoderm-spf50", "quantity": 1 }]
}
```

Exemple `POST /pos/sales/:id/refund` :

```json
{
  "items": [{ "posSaleItemId": "posSaleItemId", "quantity": 1 }],
  "reason": "Produit retourne intact",
  "paymentMethod": "CASH"
}
```

Limite v1 refund : pas encore de table `PosRefund`. Une vente remboursee est marquee `VOIDED`, ce qui bloque un second remboursement.

Le ticket POS imprimable est un justificatif client simple, non fiscal officiel. La facture POS v1 est une facture interne/proforma rattachee a `PosSale`; elle stocke les informations client saisies et recopie les lignes dans `InvoiceItem`. La fiscalisation officielle tunisienne reste a valider avant usage legal.

Produit POS v1 : un `EMPLOYEE` peut creer une reference simple, mais elle est creee avec `isActive: false` pour eviter la publication automatique sur `www.lola.tn`. Un `ADMIN` peut creer une reference active. Un futur workflow devra remplacer cette prudence par un vrai statut `DRAFT` / `POS_ONLY` / `PUBLISHED`.

Client comptoir v1 : `POST /pos/customers` cree un `User` role `CUSTOMER` inactif et un `CustomerProfile` source `POS_CREATED`. L'e-mail est optionnel ; si absent, le backend genere un email technique `@lola.local` pour respecter la contrainte unique du modele `User`, mais cet email n'est pas affiche comme contact client.

Marketing : les consentements email/SMS et notes sont stockes pour le futur CRM. Aucune campagne marketing, automatisation anniversaire ou fidelite reelle n'est lancee en v1.

Exemple `POST /pos/stock/adjust` :

```json
{
  "productId": "bioderma-photoderm-spf50",
  "quantity": 3,
  "reason": "Reception comptoir"
}
```

Exemple `POST /pos/products` :

```json
{
  "name": "Gel nettoyant test",
  "brandId": "cerave",
  "categoryId": "visage",
  "price": 38.5,
  "oldPrice": 42,
  "barcode": "619000009999",
  "sku": "POS-TEST",
  "initialStock": 4,
  "reorderLevel": 2,
  "imageUrl": "https://example.com/image.jpg",
  "description": "Produit ajoute depuis la caisse"
}
```

Exemple `POST /pos/customers` :

```json
{
  "firstName": "Amira",
  "lastName": "Ben Ali",
  "phone": "22123456",
  "email": "amira@example.com",
  "defaultAddress": "Sousse",
  "city": "Sousse",
  "birthDate": "1992-04-12",
  "marketingEmailConsent": true,
  "marketingSmsConsent": false,
  "notes": "Cliente comptoir"
}
```

Exemple `POST /pos/invoices` :

```json
{
  "posSaleId": "posSaleId",
  "customerName": "Societe Test",
  "customerPhone": "22123456",
  "customerAddress": "Sousse",
  "taxIdentifier": "MF optionnel",
  "notes": "Facture interne proforma"
}
```

## Admin

Toutes les routes Admin demandent `ADMIN`.

| Methode | Route | Statut | Description |
| --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | Implemente | Revenus web + magasin, canaux, panier moyen, alertes stock, activite recente. |
| `GET` | `/admin/orders` | Implemente | Commandes web. Projection unifiee web/POS encore future. |
| `PATCH` | `/admin/orders/:id/status` | Implemente | Mise a jour statut. Annulation restitue le stock. |
| `GET` | `/admin/inventory` | Implemente | Inventaire du magasin par defaut. |
| `PATCH` | `/admin/products/:id` | Implemente | Mise a jour produit. |
| `POST` | `/admin/inventory/adjust` | Implemente | Ajustement manuel avec mouvement de stock. |
| `POST` | `/admin/stock-adjustments` | Futur alias | Alias futur plus explicite de `/admin/inventory/adjust`. |
| `GET` | `/admin/customers` | Implemente via `/admin/clients` | CRM minimal v1. |
| `GET` | `/admin/staff` | Futur | Employes, roles, permissions et caisses autorisees. |

Reponse actuelle de `GET /admin/dashboard` :

```json
{
  "generatedAt": "2026-08-09T14:00:00.000Z",
  "store": { "id": "storeId", "code": "SOUSSE-CENTRE", "name": "LOLA Parapharmacie Sousse" },
  "revenue": { "total": 3260.0, "web": 2119.0, "store": 1141.0 },
  "channels": [
    { "channel": "WEB", "amount": 2119.0, "count": 31, "percent": 65 },
    { "channel": "STORE", "amount": 1141.0, "count": 18, "percent": 35 }
  ],
  "averageBasket": 66.53,
  "stockAlerts": {
    "outOfStock": 3,
    "lowStock": 13,
    "items": []
  },
  "recentActivity": []
}
```

## Authentification

| Methode | Route | Statut | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | Implemente | Cree un compte client. |
| `POST` | `/auth/login` | Implemente | Authentifie et retourne `accessToken` + profil. |
| `GET` | `/auth/me` | Implemente | Retourne l'utilisateur connecte. |
| `POST` | `/auth/logout` | Futur | Revocation de session/token cote serveur. |
