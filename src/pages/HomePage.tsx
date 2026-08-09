import { useMemo, useState } from 'react';
import { BrandsSection } from '../components/BrandsSection';
import { CategoriesGrid } from '../components/CategoriesGrid';
import { Hero } from '../components/Hero';
import { ProductSection } from '../components/ProductSection';
import { SocialSection } from '../components/SocialSection';
import { useCart } from '../contexts/cart-context';
import { useCatalogCategories } from '../hooks/use-catalog-categories';
import { useCatalogProducts } from '../hooks/use-catalog-products';
import { usePublicSearch } from '../components/PublicLayout';

export default function HomePage() {
  const { searchQuery } = usePublicSearch();
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState('all');
  const { products, isUsingFallback, message: productsMessage } = useCatalogProducts(searchQuery, activeCategory);
  const { categories, isUsingFallback: isUsingCategoryFallback, message: categoriesMessage } = useCatalogCategories();
  const dataMessage = productsMessage ?? categoriesMessage;

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
      {(isUsingFallback || isUsingCategoryFallback || dataMessage) && (
        <div className="section-shell pt-8">
          <p className="rounded-lg border border-primary-container bg-secondary-container/60 px-4 py-3 text-sm text-on-primary-container">
            {dataMessage ?? 'Mode démonstration : le backend n’est pas disponible.'}
          </p>
        </div>
      )}
      <CategoriesGrid categories={categories} />
      <ProductSection
        products={visibleProducts}
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={setActiveCategory}
        onAddToCart={addItem}
      />
      <BrandsSection />
      <SocialSection />
    </>
  );
}
