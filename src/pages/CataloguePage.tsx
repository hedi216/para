import { useSearchParams } from 'react-router-dom';
import { ProductCard } from '../components/ProductCard';
import { usePublicSearch } from '../components/PublicLayout';
import { useCart } from '../contexts/cart-context';
import { useCatalogCategories } from '../hooks/use-catalog-categories';
import { useCatalogProducts } from '../hooks/use-catalog-products';

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { searchQuery, setSearchQuery } = usePublicSearch();
  const { addItem } = useCart();
  const selectedCategory = searchParams.get('category') ?? 'all';
  const requestedSearch = searchParams.get('search') ?? searchQuery;
  const { products, isLoading, isUsingFallback, message: productsMessage } = useCatalogProducts(requestedSearch, selectedCategory);
  const { categories, isUsingFallback: isUsingCategoryFallback, message: categoriesMessage } = useCatalogCategories();
  const dataMessage = productsMessage ?? categoriesMessage;

  const setCategory = (category: string) => {
    const next = new URLSearchParams(searchParams);
    if (category === 'all') next.delete('category');
    else next.set('category', category);
    setSearchParams(next);
  };

  return (
    <section className="bg-surface-container-low py-14 md:py-20">
      <div className="section-shell">
        <div className="mb-10 flex flex-col gap-4 border-b border-outline-variant pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-label-sm font-bold uppercase tracking-widest text-secondary">Parapharmacie LOLA</p>
            <h1 className="mt-2 font-display text-headline-lg text-primary md:text-display-lg">Le catalogue</h1>
            <p className="mt-3 max-w-2xl text-body-md text-on-surface-variant">Des soins choisis avec attention, pour toute la famille et chaque routine.</p>
          </div>
          <label className="flex w-full max-w-sm items-center gap-2 border-b border-outline bg-transparent py-2 text-primary">
            <span className="material-symbols-outlined">search</span>
            <input
              value={requestedSearch}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                const next = new URLSearchParams(searchParams);
                if (event.target.value) next.set('search', event.target.value);
                else next.delete('search');
                setSearchParams(next);
              }}
              className="w-full bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
              placeholder="Rechercher un produit ou une marque"
            />
          </label>
        </div>

        <div className="mb-8 flex gap-2 overflow-x-auto pb-2">
          {[{ id: 'all', name: 'Tous les soins' }, ...categories].map((category) => (
            <button
              key={category.id}
              onClick={() => setCategory(category.id)}
              className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === category.id
                  ? 'border-primary bg-primary text-on-primary'
                  : 'border-outline-variant bg-surface text-primary hover:border-primary-container'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {(isUsingFallback || isUsingCategoryFallback || dataMessage) && (
          <p className="mb-5 rounded-lg border border-primary-container bg-secondary-container/60 px-4 py-3 text-sm text-on-primary-container">
            {dataMessage ?? 'Mode démonstration : le backend n’est pas disponible.'}
          </p>
        )}

        {isLoading ? (
          <div className="py-16 text-center text-on-surface-variant">Chargement des produits...</div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => <ProductCard key={product.id} product={product} onAddToCart={addItem} />)}
          </div>
        ) : (
          <div className="border border-outline-variant bg-surface p-10 text-center text-on-surface-variant">Aucun produit ne correspond à cette recherche.</div>
        )}
      </div>
    </section>
  );
}
