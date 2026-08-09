# API LOLA v1

Base locale : `http://localhost:3000`.

Les reponses utilisent JSON. Les routes protegees attendent `Authorization: Bearer <accessToken>`. Les erreurs de validation renvoient `400`, une absence de session `401` et un role insuffisant `403`.

## Catalogue public

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/products` | Liste les produits actifs. Filtres : `search`, `category`. |
| `GET` | `/products/:id` | Produit par identifiant ou slug. |
| `GET` | `/categories` | Categories actives. |
| `GET` | `/brands` | Marques. |

Chaque produit public expose notamment `price`, `oldPrice`, `stock`, `brand`, `category`, `image`, `sku`, `barcode` et `isActive`.

## Authentification

| Methode | Route | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Cree un compte client. |
| `POST` | `/auth/login` | Retourne `accessToken` et le profil. |
| `GET` | `/auth/me` | Retourne le profil de la session. |

## Commandes client

| Methode | Route | Role | Description |
| --- | --- | --- | --- |
| `POST` | `/orders` | `CUSTOMER` | Confirme une commande et decremente le stock partage. Accepte `idempotencyKey`. |
| `GET` | `/orders/my-orders` | `CUSTOMER` | Historique du client connecte. |

Corps minimal d'une commande :

```json
{
  "idempotencyKey": "web-order-uuid",
  "paymentMethod": "CASH_ON_DELIVERY",
  "recipientName": "Client LOLA",
  "recipientPhone": "22123456",
  "deliveryAddress": "Sousse",
  "deliveryCity": "Sousse",
  "items": [{ "productId": "lrp-micellaire-ultra", "quantity": 1 }]
}
```

Moyens web actifs : `CASH_ON_DELIVERY` et `IN_STORE`. `ONLINE` est explicitement refuse en v1.

## Administration

Toutes les routes suivantes necessitent le role `ADMIN`.

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/admin/dashboard` | Revenus web + POS, repartition canaux, panier moyen, alertes stock, activite recente. |
| `GET` | `/admin/products` | Catalogue complet, y compris produits masques. |
| `POST` | `/admin/products` | Cree une reference et son inventaire du magasin par defaut. |
| `PATCH` | `/admin/products/:id` | Met a jour prix, statut ou informations produit. |
| `GET` | `/admin/orders` | Toutes les commandes web. |
| `PATCH` | `/admin/orders/:id/status` | Modifie un statut. Une annulation restitue le stock. |
| `GET` | `/admin/inventory` | Inventaire du magasin Sousse. |
| `POST` | `/admin/inventory/adjust` | Ajustement manuel avec mouvement de stock. |
| `GET` | `/admin/clients` | Profils et compteurs de commandes client. |

Exemple d'ajustement :

```json
{
  "productId": "lrp-micellaire-ultra",
  "quantity": -2,
  "reason": "Casse en rayon"
}
```

## POS

Les routes POS acceptent `EMPLOYEE` et `ADMIN`.

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/pos/products?search=` | Recherche par nom, marque, SKU ou code-barres. |
| `GET` | `/pos/products/barcode/:barcode` | Produit actif exact par code-barres. |
| `POST` | `/pos/sales` | Finalise une vente, cree un ticket interne et decremente le stock. Accepte `idempotencyKey`. |
| `GET` | `/pos/sales` | Dernieres ventes caisse. |
| `GET` | `/pos/sales/:id` | Detail complet d'un ticket POS. |
| `POST` | `/pos/sales/:id/refund` | Remboursement simple : remise en stock, paiement rembourse, vente marquee `VOIDED`. |
| `GET` | `/pos/stock?search=` | Inventaire du magasin pour le POS. Recherche produit, marque, SKU ou code-barres. |
| `POST` | `/pos/stock/adjust` | Ajustement de stock avec motif obligatoire et `StockMovement`. |
| `GET` | `/pos/customers?search=` | Recherche client par nom, telephone ou email. |
| `POST` | `/pos/invoices` | Cree une facture interne/proforma v1 depuis un ticket POS. |
| `GET` | `/pos/invoices` | Liste les factures internes POS. |
| `GET` | `/pos/invoices/:id` | Detail d'une facture interne POS. |

Exemple de vente :

```json
{
  "idempotencyKey": "pos-sale-uuid",
  "registerId": "CAISSE-01",
  "paymentMethod": "CASH",
  "items": [{ "productId": "bioderma-photoderm-spf50", "quantity": 1 }]
}
```

`customerId` est optionnel et doit etre un `CustomerProfile.id`, pas un `User.id`.

Moyens POS actifs : `CASH`, `CARD`.

Le ticket client imprimable est un justificatif POS simple : il contient le ticket, la date, la caisse, l'employe, les lignes, le total, la remise fidelite affichee et la TVA 19 % incluse. Ce n'est pas une facture fiscale officielle.

La facture POS v1 est un document interne/proforma cree depuis un ticket encaisse. Elle reference `PosSale`, recopie les lignes dans `InvoiceItem` et stocke les informations client saisies. La fiscalisation officielle devra etre validee plus tard.

Exemple d'ajustement stock POS :

```json
{
  "productId": "bioderma-photoderm-spf50",
  "quantity": -1,
  "reason": "Correction inventaire caisse"
}
```

Exemple de facture interne POS :

```json
{
  "posSaleId": "posSaleId",
  "customerName": "Client LOLA",
  "customerPhone": "22123456",
  "customerAddress": "Sousse",
  "taxIdentifier": "optionnel",
  "notes": "Facture interne v1"
}
```

## Garantie de stock v1

Les commandes web confirmees, ventes POS, remboursements POS simples et ajustements appellent tous le module `InventoryService`. Une transaction PostgreSQL cree le document metier et les `StockMovement` associes ; une decrementation n'aboutit que si la quantite disponible est suffisante.
