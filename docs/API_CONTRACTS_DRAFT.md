# Contrats API draft - web, POS et Admin

Base API proposée : `https://api.lola.tn` en production et `http://localhost:3000` en développement. Les corps sont JSON, les montants TND sont des nombres à trois décimales et les dates sont ISO 8601 UTC. Les routes protégées utilisent `Authorization: Bearer <token>`.

Ce document décrit la cible d’intégration des maquettes Stitch. Certaines routes catalogue, auth, POS et Admin existent déjà dans le backend v1 ; les routes barcode, refund, dashboard, staff et logout complètent le contrat futur et ne doivent pas être considérées comme intégrées tant que leur implémentation n’est pas livrée.

## Conventions

- `storeId` et `registerId` sont obligatoires pour une vente caisse lorsque plusieurs points de vente seront activés. La v1 les déduit du magasin/caisse par défaut si nécessaire.
- `channel` vaut `WEB` ou `STORE`.
- Les erreurs emploient `{ "message": string, "code": string }`.
- Les listes paginées ajoutent `page`, `limit`, `total` et `items` lorsque le volume le nécessite.

## Public web

| Méthode | Route | Paramètres / corps | Réponse cible |
| --- | --- | --- | --- |
| `GET` | `/products` | `search`, `category`, `brand`, `page`, `limit` | Produits actifs et stock disponible. |
| `GET` | `/products/:id` | `id` ou slug | Produit, images, marque, catégorie et stock. |
| `GET` | `/categories` | Aucun | Catégories actives. |
| `POST` | `/orders` | Lignes, livraison/retrait, paiement | Commande confirmée, stock décrémenté. |

Exemple `POST /orders` :

```json
{
  "items": [{ "productId": "lrp-micellaire-ultra", "quantity": 1 }],
  "paymentMethod": "CASH_ON_DELIVERY",
  "recipientName": "Amira Ben Ali",
  "recipientPhone": "22123456",
  "deliveryAddress": "Sousse",
  "deliveryCity": "Sousse"
}
```

## POS

Toutes les routes POS demandent `EMPLOYEE` ou une permission équivalente.

| Méthode | Route | Paramètres / corps | Réponse cible |
| --- | --- | --- | --- |
| `GET` | `/pos/products?search=` | Recherche nom, marque, SKU ou code-barres | Cartes produit POS avec stock du magasin courant. |
| `GET` | `/pos/products/barcode/:barcode` | Code scanné | Produit exact ou `404 PRODUCT_NOT_FOUND`. |
| `POST` | `/pos/sales` | Panier, paiement, client facultatif, caisse | Ticket finalisé, paiement et mouvements de stock. |
| `GET` | `/pos/sales` | `from`, `to`, `registerId`, pagination | Tickets récents/historique. |
| `POST` | `/pos/sales/:id/refund` | Lignes, quantités, motif, paiement | Retour contrôlé, remboursement et entrée stock. |
| `GET` | `/pos/customers?search=` | Nom, téléphone, e-mail ou code fidélité | Clients associables avec avantages applicables. |

Exemple `POST /pos/sales` :

```json
{
  "registerId": "CAISSE-01",
  "customerId": "cus_123",
  "paymentMethod": "CASH",
  "items": [
    { "productId": "bioderma-photoderm-spf50", "quantity": 1 }
  ]
}
```

La réponse doit inclure `receiptNumber`, `status`, `subtotal`, `discountTotal`, `taxRate`, `taxTotal`, `total`, `payment`, `customer` et les lignes. Le serveur déduit et fige la TVA et la remise fidélité ; le navigateur ne les décide pas.

Exemple `POST /pos/sales/:id/refund` :

```json
{
  "items": [{ "posSaleItemId": "psi_123", "quantity": 1 }],
  "reason": "Produit retourné intact",
  "paymentMethod": "CASH"
}
```

## Admin

Toutes les routes Admin demandent `ADMIN` ou la permission métier correspondante.

| Méthode | Route | Paramètres / corps | Réponse cible |
| --- | --- | --- | --- |
| `GET` | `/admin/dashboard` | `from`, `to`, `storeId`, `timezone` | KPIs, séries, canaux, alertes et commandes récentes. |
| `GET` | `/admin/orders` | `status`, `channel`, `from`, `to`, pagination | Commandes web et projection unifiée des ventes magasin. |
| `PATCH` | `/admin/orders/:id/status` | `{ "status": "PREPARING" }` | Commande mise à jour, mouvement retour si annulation. |
| `GET` | `/admin/inventory` | `storeId`, `lowStock`, recherche, pagination | Inventaire, seuils et disponibilité. |
| `PATCH` | `/admin/products/:id` | Champs catalogue éditables | Produit mis à jour. |
| `POST` | `/admin/stock-adjustments` | Produit, magasin, delta, motif | Mouvement d’ajustement traçable. |
| `GET` | `/admin/customers` | recherche, segment, pagination | CRM, fidélité et compteurs. |
| `GET` | `/admin/staff` | storeId, actif, pagination | Employés, rôles, permissions et caisses autorisées. |

Réponse cible de `GET /admin/dashboard` :

```json
{
  "period": { "from": "2026-08-01", "to": "2026-08-09", "timezone": "Africa/Tunis" },
  "revenue": { "total": 3260.0, "previousPeriod": 2890.0, "changePercent": 12.8 },
  "channels": [
    { "channel": "WEB", "amount": 2119.0, "percent": 65 },
    { "channel": "STORE", "amount": 1141.0, "percent": 35 }
  ],
  "averageBasket": 74.0,
  "revenueSeries": [{ "date": "2026-08-09", "amount": 3260.0 }],
  "stockAlerts": { "outOfStock": 3, "lowStock": 13 },
  "recentOrders": []
}
```

## Authentification

| Méthode | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/login` | Authentifie et retourne le token/session et le profil. |
| `GET` | `/auth/me` | Retourne l’utilisateur, rôle et permissions effectives. |
| `POST` | `/auth/logout` | Invalide la session active ou son refresh token. |

`/auth/logout` nécessite une stratégie de session/révocation côté serveur ; supprimer uniquement le token du navigateur est insuffisant pour une déconnexion centralisée de personnel.
