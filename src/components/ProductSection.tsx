import { categories, type Product } from '../data/catalog';
import { ProductCard } from './ProductCard';

type ProductSectionProps = {
  products: Product[];
  activeCategory: string;
  onCategoryChange: (categoryId: string) => void;
  onAddToCart: (product: Product) => void;
};

export function ProductSection({ products, activeCategory, onCategoryChange, onAddToCart }: ProductSectionProps) {
  const filterItems = [{ id: 'all', name: 'Tous' }, ...categories];

  return (
    <section id="catalogue" className="bg-surface-container-low py-24">
      <div className="section-shell">
        <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="mb-2 font-display text-headline-lg text-primary">Nos Best-Sellers</h2>
            <p className="text-body-md text-on-surface-variant">Les favoris de nos clients pour une routine infaillible.</p>
          </div>
          <a className="whitespace-nowrap text-label-sm font-bold uppercase tracking-widest text-primary hover:underline" href="#catalogue">
            Voir tout
          </a>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {filterItems.map((category) => {
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline-variant bg-surface text-primary hover:border-primary-container hover:bg-secondary-container/60'
                }`}
                onClick={() => onCategoryChange(category.id)}
              >
                {category.name}
              </button>
            );
          })}
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onAddToCart={onAddToCart} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-outline-variant bg-surface p-8 text-center text-on-surface-variant">
            Aucun produit ne correspond à cette recherche.
          </div>
        )}
      </div>
    </section>
  );
}
