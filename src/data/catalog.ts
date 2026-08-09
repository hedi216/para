export type Badge = 'Promo' | 'Nouveau' | 'Best-seller';

export type Category = {
  id: string;
  name: string;
  label: string;
  image: string;
  featured?: boolean;
};

export type Product = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  stock: number;
  badge?: Badge;
  rating: number;
  reviews: number;
};

export type Brand = {
  id: string;
  name: string;
};

export type Offer = {
  id: string;
  title: string;
  description: string;
  productIds: string[];
};

export const heroImage =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAMiBtrLG2vVTgD3dRg5SfgxqPoRpOaN4EUm9EAK6icQyD5agYhzrEE4PMoY-eg-hqb02_Fx3vkKgxoO-VbEHTgS-oyGw5MIAFQJDt4SkD0O4V06IvpCUimQRP8RPXUwL-9cIDZR9lE-jzPnm6MeYVbf2Z5IB8fy84R2_bUQWMc4Z5KJrx7m5mP2d8ZKYRyrNrvCtMc5yIEqVJAzXcBINBxGZPLzdxCYWFEVmh3OadfeCkWywogA8yP';

export const categories: Category[] = [
  {
    id: 'visage',
    name: 'Visage',
    label: 'Soin du Visage',
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBKHX6lOOyCxDSbQjK6eX-fdhetrYntII8zk4zifafnFqHkm85hSbWxBMmlKVw_svcsB41DCh6YzzDnLx98ATEbJ9d6mH0NWa9AS2v_KYVb1xmaVo44HpVphyc0oDwA-WR0lYSZf2jN5rv6gjv0ZiE3a24ofiF3I58gkQArybt6sMGB4wj5D14QaLvz9BGBCuIKEgQOP-dvC_-HL3GXRyTGt9kJM-hcFLMJPT525DVqrr6i_QiqVDHm',
  },
  {
    id: 'corps-bain',
    name: 'Corps & Bain',
    label: 'Corps & Bain',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDKtOIEKtcTFUTh-CFL6sv-c9Fs1WrPschDD0Ko9oeW8M1RO07UsIkB0_RpselSHqJ5Jh29Ln0Rd5FPXfIRKP9vHTc1nDamNIdj5mBr1PMTVpFf5KKhpjNIEpmIdZQTBOZ3hWbXFF5BY6zJ0XtUMf_TRqfpdptcae3rLqhhL5Q_B1G10VmfAedXTbhQYrbMei7iwEsfLBQdz5wz-M538C4mawWS2pX-K_hDj_gieUqDY2WOscJBA3zB',
  },
  {
    id: 'bebe-maman',
    name: 'Bébé & Maman',
    label: 'Univers Bébé',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBvi4rd0qBwAxGE2dohrKwlEAlG60qDOR55N4CozmMuAK5oC42v-w1_Ws2A2RlmRiwZC84oWXraW_pH-9wCF4DO-LrGUDKyt3Pz-prO3hLX9IVSSNHR8_RFICLSoK5HWg-0owJ6Tz6FPTe5itKoTB6fLCID1I_qIx5S_6h_SVCA5W-T4UUP9rhyQcjDtuLLJVN-iBGENDn4825YuT8bqNeREwE-Z8CAzAXx14wRqIVpcz-o2RNcAKM8',
  },
  {
    id: 'korean-beauty',
    name: 'Korean Beauty',
    label: 'Korean Beauty',
    featured: true,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBcJjh34Rpv9mRixIapCbjc9S5ApV9kN3NaGqgFO2D8ZJ5jxxPgOnY_GncqI8ovHm2i9TsGddJlmg8Hz43Pp1b20Zb22csAjnG-44WktDswJShMcdQQ_n0qFOBYN78l-Ij3ocdsJLhPzLVCnxsyILfdkFyHsQ8gZquLpHfoObK2WxYCBQSWRaXOcDerMVDqrX11h9zFuH9o2F8nze9usrJriWI6v3iYftHQsXBB3ltisbL1d-pOzBpD',
  },
  { id: 'cheveux', name: 'Cheveux', label: 'Cheveux', image: 'https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&q=80' },
  { id: 'solaire', name: 'Solaire', label: 'Solaire', image: 'https://images.unsplash.com/photo-1521223344201-d169129f7b4d?auto=format&fit=crop&w=1200&q=80' },
  { id: 'complements', name: 'Compléments alimentaires', label: 'Compléments', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80' },
  { id: 'hygiene', name: 'Hygiène', label: 'Hygiène', image: 'https://images.unsplash.com/photo-1607006483224-70c9f97c12e9?auto=format&fit=crop&w=1200&q=80' },
  { id: 'marques', name: 'Marques', label: 'Marques', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1200&q=80' },
];

export const products: Product[] = [
  {
    id: 'lrp-micellaire-ultra',
    name: 'Eau Micellaire Ultra',
    brand: 'La Roche-Posay',
    category: 'visage',
    price: 58.9,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCSIMkChzPyNEOjfq2hXZk6rjZrvnRomaXuM5Egp1GjVQHxmr_Rc9X4eAZZpDcXUj8lJUxfolFP5292X6w-pIE5jSpmd3qWg4TIM5kBJokNlWHG2wmva5K7728lQIu_1ssKNVkhwH8oqems08r5Urtjdo7Zwlqesp7izkfH-7N9sgfDyj41CHJEyIQFzlBU86csmV8sCb9bBe_xC8YZ_fas6kRLwwGA_14i2vp1yQy3nxiiv3wJn_gY',
    stock: 12,
    badge: 'Best-seller',
    rating: 4.5,
    reviews: 124,
  },
  {
    id: 'bioderma-photoderm-spf50',
    name: 'Photoderm Max SPF50+',
    brand: 'Bioderma',
    category: 'solaire',
    price: 45.5,
    oldPrice: 54.9,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC5adUHm2NMAy2DjZfSPkfIN5_BieCfyN-x9z7xlCiNvYmaxLrdep5rehkY5f9fHmAv4Ltnf8pmNFLKojI8Q_k2TU71pm82SHSl93XbSlnU2wQMEqfpcK1Wr7gc1C1sVUowuQl13J7v_Wftz5xQf6eg5J38cyrBhzXEEbY64aYPAi7skQ8wc7XSXEgsx8mbrRjo8H6rFjWzGdRvcjV0zosZbayxMoNiEKxqM_hwt7OXMyfFW3hbLQIM',
    stock: 7,
    badge: 'Promo',
    rating: 5,
    reviews: 89,
  },
  {
    id: 'cerave-creme-lavante',
    name: 'Crème Lavante Hydratante',
    brand: 'CeraVe',
    category: 'corps-bain',
    price: 62,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBv4hvc_W92XyhUazLT4ahufuYgTB_phrZHL8O9FKTI6IOqcooxTqX8lAI1BuX1k6xC5tX435g4VPX7PM9UKRZVZoljWXLyYH_07lIfYlya07xZ6ZhOwXWuVYNvaaAsxLl8OTo2E2mgoxCsLLKxP6IbpR4ZoT7kkNP4AR-PvQ-CcKLeN_X7KndKuctogeD5VdQKuOCj0N51C9q8Z4f23XZA5-YuQUS6a5dAmdn1PHB3OEcoun-4rJYD',
    stock: 0,
    rating: 4,
    reviews: 210,
  },
  {
    id: 'cosrx-snail-mucin',
    name: 'Advanced Snail 96 Mucin',
    brand: 'COSRX',
    category: 'korean-beauty',
    price: 75,
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAvLfIXW3ysPLsTTOi8lUaoTiYsqC6dnp9E-OWnOfhHegFCxDEi6agn_1FR5cfUz_3DwnQsyFsbFx7pDt87IPt-J0bIbmk9fa1-TIfYoRLTaJyYrWyk13jPqojr099THIQAPzsZHjVXWIrmlQWji0TCGsPfN24vOkQTwPhVil21cJryVw-6E8My1rFdc2Si9_wNVSFBmHegETXkgXnXe01SZDz1T99GrwlyEaWKXcPOuvbvXsVBW5Fg',
    stock: 18,
    badge: 'Nouveau',
    rating: 5,
    reviews: 56,
  },
  {
    id: 'mustela-lait-corps',
    name: 'Lait Corps Hydra Bébé',
    brand: 'Mustela',
    category: 'bebe-maman',
    price: 39.8,
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=900&q=80',
    stock: 9,
    rating: 4.5,
    reviews: 73,
  },
  {
    id: 'vichy-mineral-89',
    name: 'Minéral 89 Booster',
    brand: 'Vichy',
    category: 'visage',
    price: 89,
    oldPrice: 105,
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&w=900&q=80',
    stock: 5,
    badge: 'Promo',
    rating: 4.5,
    reviews: 98,
  },
  {
    id: 'avene-cleanance',
    name: 'Cleanance Gel Nettoyant',
    brand: 'Avène',
    category: 'hygiene',
    price: 52.5,
    image: 'https://images.unsplash.com/photo-1620916297397-a4a5402a3c6c?auto=format&fit=crop&w=900&q=80',
    stock: 14,
    rating: 4,
    reviews: 141,
  },
  {
    id: 'nuxe-huile-prodigieuse',
    name: 'Huile Prodigieuse',
    brand: 'Nuxe',
    category: 'corps-bain',
    price: 78.5,
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=900&q=80',
    stock: 4,
    badge: 'Best-seller',
    rating: 5,
    reviews: 167,
  },
];

export const brands: Brand[] = [
  { id: 'bioderma', name: 'BIODERMA' },
  { id: 'mustela', name: 'MUSTELA' },
  { id: 'la-roche-posay', name: 'LA ROCHE-POSAY' },
  { id: 'cerave', name: 'CERAVE' },
  { id: 'vichy', name: 'VICHY' },
  { id: 'svr', name: 'SVR' },
  { id: 'avene', name: 'AVÈNE' },
  { id: 'uriage', name: 'URIAGE' },
  { id: 'eucerin', name: 'EUCERIN' },
  { id: 'nuxe', name: 'NUXE' },
  { id: 'filorga', name: 'FILORGA' },
  { id: 'cosrx', name: 'COSRX' },
];

export const offers: Offer[] = [
  {
    id: 'routine-solaire',
    title: 'Routine solaire experte',
    description: 'Photoprotection haute tolérance avec prix doux sur la sélection SPF.',
    productIds: ['bioderma-photoderm-spf50'],
  },
  {
    id: 'routine-hydratation',
    title: 'Hydratation visage et corps',
    description: 'Les essentiels dermo-cosmétiques pour restaurer la barrière cutanée.',
    productIds: ['cerave-creme-lavante', 'vichy-mineral-89'],
  },
];

export const socialImages = [
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBC--6Rtx-7jQDaeqKoPs8v2e3HCK_XhbHySWrwraAx1nuTLSdxZTCudEpHeuWYmaNi-imJTUD9pf7_0AAtyejtbPcfSeqhgXw5SHpxONA8y5gLivHV27TBIru-ITxcSoCIcsJ4bJoRpMxWS_hK92VO3yNSWKYLYiCxK14eyGCYbpKNIT3_vrq08jVqlWSvmpaXSJ8dFesJs_RzWfzKRmcPylho6MHWBTnGpoALuXU-IO2Lze_KBxab',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBmp-xNUApwyF5vUX-gsxSkXER6T-EHEuMpWtHYBoDB0-k91NHA3bnKyeZ8FDfyE3dZhKT5grQgkn3SUd8RIhYbloZ1DsY_c3ctTSdD1Aar_jHEEK1uow8G8go9peDcyhuEW93Mp10kSJvmtBU4d6JH0sK4LGpo6Gt_2v-TV0JFoqQnC6tkvRkj9UbSkCqIeoa2ufBcHrSg9Yy0j6bqMKJZtDSynAC8-UeN37iCtclVqQijJzHzoVGR',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDUgSBxq9ojXEVcVMql1U1LS8kokvJsXg1lDsOoKByDNeleof359mJvOGiGhrTrMZpNsS893cMJcrSPijDzD0d8xxL2PJNae9YBzlucGD0Gp8SWKOEXbyxMpNTgUNySnUQunkiELUa-89VSUIzB36spbEBwayC45YLwk8t7XSAKZBUWb9At-uUmyBUFFKwiVywR0DHexsgZEDLNutorH1WFe29uBDBv83nnsASmyJkKIOGi1Ulwp3uG',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCfcHOSn4jRuBrQuGWxiErs9NdcXyW3WT6esRMnV568SZmsV72hDAJFtRZmF3YYQMKIx0nPpmUvmS4c74-ZWLmSDA1vFHqUQcOSM1SFdqzopQnLU8syhkiDtxXklWuZzXsnlD7PX9WN9jD7ygs1JQg6yND48F3RjBJerEBMoNw-B4Jcr0ZESc-j_5P9r_i7DLOfIZNkL2knocq0h6ZZU5PalNm3DhGAhkaH0jE9sW9HPsIO_yBrQ4Ga',
];
