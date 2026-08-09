# Audit actuel

## Stack actuelle

Le projet est maintenant une base frontend moderne pour le site public LOLA Parapharmacie.

- Vite
- React
- TypeScript
- Tailwind CSS
- Google Fonts : Libre Caslon Text et Manrope
- Material Symbols pour les icônes

Le projet initial Stitch est conservé sous forme de référence dans `code.html`, `DESIGN.md` et `screen.png`.

## Structure frontend actuelle

```text
src/
  assets/
    logoLolla.jpg
  components/
    BrandsSection.tsx
    CategoriesGrid.tsx
    Footer.tsx
    Header.tsx
    Hero.tsx
    Icon.tsx
    ProductCard.tsx
    ProductSection.tsx
    SocialSection.tsx
  data/
    catalog.ts
  pages/
    HomePage.tsx
  styles/
    index.css
  main.tsx
```

Fichiers de configuration principaux :

- `package.json`
- `vite.config.ts`
- `tailwind.config.js`
- `tsconfig.json`
- `index.html`

## Fonctionnalités déjà présentes

Le site public `www.lola.tn` dispose d'une première page e-commerce responsive avec :

- Header avec vrai logo LOLA
- Navigation catégories
- Champ de recherche visuel
- Hero fidèle à la maquette Stitch
- Grille de catégories
- Section best-sellers / catalogue
- Filtres simples par catégorie
- Produits avec marque, prix, note, badge et image
- Ancien prix / prix promo
- Etat rupture de stock
- Bouton ajouter au panier
- Compteur panier dans le header
- Marques partenaires
- Section Instagram / social proof
- Footer en français
- Favicon basé sur le logo

Le build de production passe avec `npm run build`.

## Limites actuelles

Le frontend est une fondation, pas encore une application e-commerce complète.

- Pas de backend
- Pas de vraie base de données
- Pas d'authentification
- Pas de compte client
- Pas de vraie page produit
- Pas de vrai panier persistant
- Pas de checkout
- Pas de gestion commandes
- Pas de paiement
- Pas de livraison/retrait configurés
- Pas de stock réel
- Pas de POS
- Pas de dashboard admin
- Pas de système d'import produits
- Pas de gestion fournisseurs, achats, factures ou retours

## Ce qui est seulement mocké

Les éléments suivants sont simulés dans `src/data/catalog.ts` :

- Catégories
- Produits
- Marques
- Offres
- Prix
- Stock
- Badges produit
- Notes et avis
- Images produit

Le compteur panier est un état local React. Il ne crée pas de commande, ne réserve pas le stock et ne persiste pas après rechargement.

## Risques avant backend

Le risque principal est de coder trop tôt un backend générique sans valider les règles métier réelles de la pharmacie.

Points sensibles :

- Stock unique entre web, caisse et admin
- Gestion des lots et dates d'expiration si obligatoire
- TVA, factures officielles et obligations comptables tunisiennes
- Remplacement ou non de la caisse actuelle
- Modes de livraison et paiement
- Gestion des retours, remboursements et avoirs
- Droits employés sur prix, remises et corrections de stock
- Import initial des produits, prix, codes-barres et stock
- Fiabilité du POS si Internet est instable en magasin

Avant de développer le backend, il faut valider les questions métier listées dans `docs/QUESTIONS_CLIENT.md`.
