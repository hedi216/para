import { useMemo, useState } from 'react';
import { BrandsSection } from '../components/BrandsSection';
import { CategoriesGrid } from '../components/CategoriesGrid';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { ProductSection } from '../components/ProductSection';
import { SocialSection } from '../components/SocialSection';
import { products, type Product } from '../data/catalog';

export default function HomePage() {
  const [cartCount, setCartCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

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

  const addToCart = (product: Product) => {
    if (product.stock > 0) {
      setCartCount((count) => count + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-background antialiased selection:bg-primary-container selection:text-on-primary-container">
      <Header cartCount={cartCount} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <main>
        <Hero />
        <CategoriesGrid />
        <ProductSection
          products={visibleProducts}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          onAddToCart={addToCart}
        />
        <BrandsSection />
        <SocialSection />
      </main>
      <Footer />
    </div>
  );
}
