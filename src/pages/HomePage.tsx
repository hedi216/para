import { useMemo, useState } from 'react';
import { BrandsSection } from '../components/BrandsSection';
import { CategoriesGrid } from '../components/CategoriesGrid';
import { Hero } from '../components/Hero';
import { ProductSection } from '../components/ProductSection';
import { SocialSection } from '../components/SocialSection';
import { useCart } from '../contexts/cart-context';
import { useCatalogProducts } from '../hooks/use-catalog-products';
import { usePublicSearch } from '../components/PublicLayout';

export default function HomePage() {
  const { searchQuery } = usePublicSearch();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const { products } = useCatalogProducts(searchQuery, activeCategory);

  const visibleProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLocaleLowerCase('fr-FR');

    return products.filter((product) => {
      const matchesCategory = activeCategory === 'all' || product.category === activeCategory;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${product.name} ${product.brand}`.toLocaleLowerCase('fr-FR').includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  return (
    <>
      <Hero />
      <CategoriesGrid />
      <ProductSection
        products={visibleProducts}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onAddToCart={addItem}
      />
      <BrandsSection />
      <SocialSection />
    </>
  );
}
