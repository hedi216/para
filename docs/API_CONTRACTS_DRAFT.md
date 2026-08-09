# Contrats API draft - web, POS et Admin

Base API locale : `http://localhost:3000`. Base cible production : `https://api.lola.tn`.

Les corps sont JSON, les montants TND sont des nombres a trois decimales, et les routes protegees utilisent `Authorization: Bearer <token>`.

## Etat d'implementation v1

Deja implemente :

- Catalogue public : `GET /products`, `GET /products/:id`, `GET /categories`, `GET /brands`.
- Auth : `POST /auth/register`, `POST /auth/login`, `GET /auth/me`.
- Commandes web : `POST /orders`, `GET /orders/my-orders`.
- POS : `GET /pos/products`, `GET /pos/products/barcode/:barcode`, `POST /pos/sales`, `GET /pos/sales`, `POST /pos/sales/:id/refund`.
- Admin : `GET /admin/dashboard`, `GET /admin/products`, `POST /admin/products`, `PATCH /admin/products/:id`, `GET /admin/orders`, `PATCH /admin/orders/:id/status`, `GET /admin/inventory`, `POST /admin/inventory/adjust`, `GET /admin/clients`.

Encore futur :

- `GET /pos/customers?search=`
- `GET /admin/staff`
- `POST /auth/logout` avec revocation serveur
- pagination/filtres avances sur plusieurs listes
- module retours complet, fidelite complete et TVA configurable

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
| `GET` | `/pos/products?search=` | Implemente | Recherche nom, marque, SKU ou code-barres. |
| `GET` | `/pos/products/barcode/:barcode` | Implemente | Produit actif exact par code-barres. |
| `POST` | `/pos/sales` | Implemente | Vente caisse, paiement manuel, caisse, mouvements de stock. |
| `GET` | `/pos/sales` | Implemente | 100 dernieres ventes caisse. |
| `POST` | `/pos/sales/:id/refund` | Implemente simple | Restitue le stock, cree un paiement rembourse et marque la vente `VOIDED`. |
| `GET` | `/pos/customers?search=` | Futur | Recherche client pour association/fidelite. |

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
