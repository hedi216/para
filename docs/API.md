# API LOLA v1

Base locale : `http://localhost:3000`.

Les réponses utilisent JSON. Les routes protégées attendent `Authorization: Bearer <accessToken>`. Les erreurs de validation renvoient `400`, une absence de session `401` et un rôle insuffisant `403`.

## Catalogue public

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/products` | Liste les produits actifs. Filtres : `search`, `category`. |
| `GET` | `/products/:id` | Produit par identifiant ou slug. |
| `GET` | `/categories` | Catégories actives. |
| `GET` | `/brands` | Marques. |

Chaque produit public expose notamment `price`, `oldPrice`, `stock`, `brand`, `category`, `image` et `isActive`.

## Authentification

| Méthode | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Crée un compte client. |
| `POST` | `/auth/login` | Retourne `accessToken` et le profil. |
| `GET` | `/auth/me` | Retourne le profil de la session. |

Exemple de connexion :

```json
{
  "email": "client@lola.tn",
  "password": "Client123!"
}
```

## Commandes client

| Méthode | Route | Rôle | Description |
| --- | --- | --- | --- |
| `POST` | `/orders` | `CUSTOMER` | Confirme une commande et décrémente le stock partagé. |
| `GET` | `/orders/my-orders` | `CUSTOMER` | Historique du client connecté. |

Corps minimal d’une commande :

```json
{
  "paymentMethod": "CASH_ON_DELIVERY",
  "recipientName": "Client LOLA",
  "recipientPhone": "22123456",
  "deliveryAddress": "Sousse",
  "deliveryCity": "Sousse",
  "items": [{ "productId": "lrp-micellaire-ultra", "quantity": 1 }]
}
```

Moyens web actifs : `CASH_ON_DELIVERY` et `IN_STORE`. `ONLINE` est explicitement refusé en v1.

## Administration

Toutes les routes suivantes nécessitent le rôle `ADMIN`.

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/admin/products` | Catalogue complet, y compris produits masqués. |
| `POST` | `/admin/products` | Crée une référence et son inventaire du magasin par défaut. |
| `PATCH` | `/admin/products/:id` | Met à jour prix, statut ou informations produit. |
| `GET` | `/admin/orders` | Toutes les commandes web. |
| `PATCH` | `/admin/orders/:id/status` | Modifie un statut. Une annulation restitue le stock. |
| `GET` | `/admin/inventory` | Inventaire du magasin Sousse. |
| `POST` | `/admin/inventory/adjust` | Ajustement manuel avec mouvement de stock. |
| `GET` | `/admin/clients` | Profils et compteurs de commandes client. |

Exemple d’ajustement :

```json
{
  "productId": "lrp-micellaire-ultra",
  "quantity": -2,
  "reason": "Casse en rayon"
}
```

## POS

Les routes POS acceptent `EMPLOYEE` et `ADMIN`.

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/pos/products?search=` | Recherche par nom, marque, SKU ou code-barres. |
| `POST` | `/pos/sales` | Finalise une vente, crée un ticket interne et décrémente le stock. |
| `GET` | `/pos/sales` | Dernières ventes caisse. |

Exemple de vente :

```json
{
  "paymentMethod": "CASH",
  "items": [{ "productId": "bioderma-photoderm-spf50", "quantity": 1 }]
}
```

Moyens POS actifs : `CASH`, `CARD`.

## Garantie de stock v1

Les commandes web confirmées, ventes POS et ajustements appellent tous le module `InventoryService`. Une transaction PostgreSQL crée le document métier et les `StockMovement` associés ; une décrémentation n’aboutit que si la quantité disponible est suffisante.
