# Questions client avant backend

Ce document liste les questions à poser au propriétaire avant de figer le backend. Certaines réponses changent fortement le modèle de données, les priorités et le niveau de risque du projet.

## Magasin et organisation

1. LOLA a-t-elle un seul magasin aujourd'hui ou plusieurs points de vente sont-ils prévus ?
2. Le stock doit-il être suivi par point de vente ou seulement globalement ?
3. Y a-t-il un dépôt séparé du magasin ?
4. Qui utilise le système au quotidien : propriétaire, pharmaciens, vendeurs, préparateurs ?

## POS / caisse

1. Le POS doit-il remplacer la caisse actuelle ou seulement compléter le site web ?
2. Faut-il gérer une clôture de caisse journalière ?
3. Faut-il gérer plusieurs caisses ou plusieurs employés connectés en même temps ?
4. Quelle imprimante ticket sera utilisée ?
5. Le ticket doit-il être imprimé, envoyé par email/WhatsApp, ou les deux ?
6. Un scanner code-barres sera-t-il utilisé ?
7. Le POS doit-il continuer à fonctionner si Internet est instable ?

## Catalogue, produits et stock

1. Existe-t-il déjà un fichier Excel produits/stock/prix ?
2. Quels champs existent déjà : nom, marque, catégorie, prix achat, prix vente, TVA, stock, code-barres, fournisseur ?
3. Les produits ont-ils tous des codes-barres ?
4. Faut-il gérer plusieurs codes-barres pour un même produit ?
5. Faut-il gérer les lots et dates d'expiration ?
6. Faut-il afficher les dates d'expiration dans l'admin seulement ou aussi alerter les employés ?
7. Faut-il gérer un seuil de stock faible par produit ?
8. Certains produits sont-ils vendus en lots, packs ou formats multiples ?
9. Certains produits doivent-ils être visibles en magasin mais cachés du site web ?

## Prix, TVA et facturation

1. Faut-il gérer la TVA ?
2. Les prix affichés au client sont-ils TTC ?
3. Faut-il générer des factures officielles ?
4. Faut-il générer seulement des tickets de caisse pour le POS ?
5. Faut-il gérer les avoirs ou notes de crédit pour les retours ?
6. Faut-il conserver un historique des changements de prix ?
7. Qui peut modifier les prix ?

## Paiement, livraison et retrait

1. Quels moyens de paiement sont souhaités : paiement à la livraison, carte bancaire, virement, paiement en magasin ?
2. Le retrait magasin est-il prévu dès le lancement ?
3. La livraison concerne-t-elle Sousse seulement ou toute la Tunisie ?
4. Quels transporteurs ou livreurs seront utilisés ?
5. Les frais de livraison sont-ils fixes, par zone, par montant de commande ou gratuits au-dessus d'un seuil ?
6. Faut-il confirmer manuellement les commandes avant préparation ?
7. Quand le stock doit-il baisser pour une commande web : validation panier, confirmation commande, paiement, préparation ou expédition ?

## Commandes externes

1. Les commandes WhatsApp doivent-elles être intégrées ?
2. Les commandes Facebook ou Instagram doivent-elles être intégrées ?
3. Aujourd'hui, comment ces commandes sont-elles prises et suivies ?
4. Faut-il créer des commandes manuelles depuis l'admin ou le POS ?

## Promotions et fidélité

1. Les promotions sont-elles simples : prix barré, pourcentage, montant fixe ?
2. Faut-il des règles avancées : 2 achetés 1 offert, panier minimum, marques spécifiques, catégories spécifiques ?
3. Les coupons sont-ils nécessaires dès le lancement ?
4. Faut-il un système fidélité ?
5. Si oui, fidélité par points, cashback, niveaux client ou remises automatiques ?
6. Faut-il un avantage anniversaire ?
7. Les promotions doivent-elles s'appliquer au web, au POS ou aux deux ?

## Rôles et droits

1. Quels rôles employés sont nécessaires ?
2. Qui peut modifier les prix ?
3. Qui peut modifier le stock ?
4. Qui peut annuler une vente ?
5. Qui peut appliquer une remise manuelle ?
6. Qui peut créer un remboursement ou un retour ?
7. Faut-il valider certaines actions par un manager ?

## Fournisseurs, achats et réceptions

1. Faut-il gérer les fournisseurs ?
2. Faut-il enregistrer les achats fournisseur ?
3. Faut-il gérer les bons de commande fournisseur ?
4. Faut-il gérer les réceptions partielles ?
5. Faut-il suivre les prix d'achat pour calculer les marges ?
6. Faut-il scanner les produits lors de la réception ?

## Rapports et statistiques

1. Quels rapports sont indispensables au lancement ?
2. Faut-il suivre le chiffre d'affaires par canal : web, POS, total ?
3. Faut-il suivre les marges ?
4. Faut-il suivre les produits les plus vendus ?
5. Faut-il des alertes de stock faible ?
6. Faut-il des alertes d'expiration proche ?
7. Faut-il exporter les données vers Excel ?
8. Faut-il un reporting mensuel imprimable ?

## Langues et contenu

1. Le site doit-il être en français seulement ?
2. Faut-il prévoir l'arabe ?
3. Faut-il prévoir l'anglais ?
4. Les fiches produits seront-elles rédigées par LOLA ou importées depuis les marques/fournisseurs ?
5. Qui prépare les images produits ?

## Points de vigilance

- Si les lots et dates d'expiration sont nécessaires, le modèle de stock doit être plus détaillé dès le départ.
- Si le POS remplace la caisse actuelle, il faut traiter le projet comme un système critique de vente, pas seulement comme un outil interne.
- Si les factures officielles sont obligatoires, il faut valider les règles comptables avant d'écrire le module facturation.
- Si les commandes WhatsApp/Facebook sont importantes, il faut décider si elles deviennent des commandes manuelles ou une vraie intégration.
