import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Product } from '../data/catalog';
import { useCart } from '../contexts/cart-context';
import { apiFetch } from '../lib/api';
import { findMockProduct, mapApiProduct } from '../lib/catalog';
import { formatPrice } from '../lib/currency';
import type { ApiProduct } from '../types/api';
import { Icon } from '../components/Icon';

export default function ProductPage() {
  const { id = '' } = useParams();
  const [product, setProduct] = useState<Product | undefined>(() => findMockProduct(id));
  const [isLoading, setIsLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    let isCurrent = true;
    setIsLoading(true);
    apiFetch<ApiProduct>(`/products/${id}`)
      .then((response) => isCurrent && setProduct(mapApiProduct(response)))
      .catch(() => isCurrent && setProduct(findMockProduct(id)))
      .finally(() => isCurrent && setIsLoading(false));
    return () => { isCurrent = false; };
  }, [id]);

  if (isLoading && !product) {
    return <div className="section-shell py-24 text-center text-on-surface-variant">Chargement du produit...</div>;
  }
  if (!product) {
    return (
      <div className="section-shell py-24 text-center">
        <h1 className="font-display text-headline-lg text-primary">Produit introuvable</h1>
        <Link to="/catalogue" className="mt-6 inline-flex bg-primary px-5 py-3 text-label-md text-on-primary">Retour au catalogue</Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;
  return (
    <section className="section-shell py-12 md:py-20">
      <Link to="/catalogue" className="mb-8 inline-flex items-center gap-2 text-label-sm font-bold uppercase tracking-widest text-primary hover:underline">
        <Icon name="arrow_back" className="text-[18px]" /> Catalogue
      </Link>
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="flex min-h-[420px] items-center justify-center bg-surface-container-lowest p-10">
          <img src={product.image} alt={`${product.brand} ${product.name}`} className={`max-h-[480px] w-full object-contain mix-blend-multiply ${isOutOfStock ? 'grayscale opacity-55' : ''}`} />
        </div>
        <div className="flex flex-col justify-center">
          <p className="text-label-sm font-bold uppercase tracking-widest text-secondary">{product.brand}</p>
          <h1 className="mt-3 font-display text-display-lg-mobile text-primary md:text-display-lg">{product.name}</h1>
          <p className="mt-5 text-body-lg text-on-surface-variant">Un soin sélectionné par LOLA pour accompagner votre routine avec efficacité et douceur.</p>
          <div className="mt-8 border-y border-outline-variant py-6">
            {product.oldPrice && <p className="text-sm text-on-surface-variant line-through">{formatPrice(product.oldPrice)}</p>}
            <p className="font-display text-headline-lg text-primary">{formatPrice(product.price)}</p>
            <p className={`mt-2 text-sm font-semibold ${isOutOfStock ? 'text-error' : 'text-tertiary'}`}>
              {isOutOfStock ? 'Rupture de stock' : `${product.stock} article${product.stock > 1 ? 's' : ''} disponible${product.stock > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            disabled={isOutOfStock}
            onClick={() => addItem(product)}
            className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 bg-primary px-6 py-3 text-label-md font-semibold uppercase tracking-[0.05em] text-on-primary transition hover:bg-surface-tint disabled:cursor-not-allowed disabled:opacity-45"
          >
            <Icon name="shopping_bag" className="text-[20px]" />
            {isOutOfStock ? 'Indisponible' : 'Ajouter au panier'}
          </button>
        </div>
      </div>
    </section>
  );
}
