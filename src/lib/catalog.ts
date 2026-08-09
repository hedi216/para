import { products, type Badge, type Product } from '../data/catalog';
import type { ApiProduct } from '../types/api';

const fallbackImage = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80';

export function mapApiProduct(product: ApiProduct): Product {
  const badge = product.badge === 'Promo' || product.badge === 'Nouveau' || product.badge === 'Best-seller'
    ? product.badge as Badge
    : undefined;

  return {
    id: product.id,
    name: product.name,
    brand: product.brand.name,
    category: product.category.slug,
    price: Number(product.price),
    oldPrice: product.oldPrice === null || product.oldPrice === undefined ? undefined : Number(product.oldPrice),
    image: product.image ?? fallbackImage,
    stock: product.stock,
    badge,
    rating: 5,
    reviews: 0,
  };
}

export function findMockProduct(id: string) {
  return products.find((product) => product.id === id);
}

export function filterMockProducts(search = '', category?: string) {
  const query = search.trim().toLocaleLowerCase('fr-FR');
  return products.filter((product) => {
    const matchesCategory = !category || category === 'all' || product.category === category;
    const matchesSearch = !query || `${product.name} ${product.brand}`.toLocaleLowerCase('fr-FR').includes(query);
    return matchesCategory && matchesSearch;
  });
}
