# Plan frontend multi-app LOLA

## Décision de cette étape

Ne pas déplacer le frontend actuel. Il comporte déjà des routes publiques, des contextes, une couche API et des écrans opérationnels en cours de stabilisation. Déplacer les fichiers vers `src/apps/*` maintenant créerait un risque de régression sans apporter de valeur immédiate, puisque les écrans Stitch POS/Admin ne sont pas encore intégrés.

Cette étape ajoute seulement les contrats et types partagés. L’intégration future doit convertir les références Stitch en composants, pas recopier les HTML statiques.

## Cible recommandée

```text
src/
  apps/
    web/                 # routes et pages www.lola.tn
    pos/                 # routes et écrans app.lola.tn
    admin/               # routes et écrans admin.lola.tn
  shared/
    components/          # Button, DataTable, PageShell, StatusBadge
    design/              # tokens LOLA, formatters, icônes
    hooks/
  services/
    api/                 # client HTTP et modules produits, ventes, rapports
  types/
    product.ts
    order.ts
    pos.ts
    admin.ts
    user.ts
```

## Migration en étapes

1. Stabiliser les contrats API et les types dans `src/types/`.
2. Extraire les composants véritablement communs sans déplacer les pages publiques.
3. Convertir le POS Stitch dans `src/apps/pos/`, avec ses propres layout et routes.
4. Convertir le dashboard Admin Stitch dans `src/apps/admin/` après disponibilité des métriques API.
5. Migrer les pages web vers `src/apps/web/` seulement lorsqu’une modification fonctionnelle les touche.
6. À ce stade, envisager un workspace avec trois builds/déploiements distincts pour `www`, `app` et `admin`.

## Règles de partage

- Ne partager que composants, tokens, formatteurs, services et types stables.
- Ne pas partager les shells de page : le web éditorial, le POS dense et l’Admin analytique ont des usages différents.
- Les contrôles de rôle restent dans chaque application, mais utilisent le même client auth et les mêmes types.
- Le design system commun reste : `#44664f`, `#8fb399`, `#faf9f6`, `#e8e2d6`, Libre Caslon Text et Manrope.
