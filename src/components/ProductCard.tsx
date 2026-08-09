import type { Product } from '../data/catalog';
import { Link } from 'react-router-dom';
import { formatPrice } from '../lib/currency';
import { Icon } from './Icon';

type ProductCardProps = {
  product: Product;
  onAddToCart: (product: Product) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const fullStars = Math.floor(product.rating);
  const hasHalfStar = product.rating % 1 >= 0.5;

  return (
    <article className="group rounded-xl border border-transparent bg-surface p-4 shadow-soft transition-all hover:border-primary-container hover:shadow-soft-lg">
      <Link to={`/produit/${product.id}`} className="relative mb-4 flex aspect-[4/5] items-center justify-center overflow-hidden rounded-lg bg-surface-container-lowest">
        <img
          className={`h-4/5 object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105 ${isOutOfStock ? 'opacity-55 grayscale' : ''}`}
          src={product.image}
          alt={`${product.brand} ${product.name}`}
        />
        {product.badge && (
          <div className="absolute left-2 top-2">
            <span className="rounded-full bg-tertiary-container/20 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-tertiary">
              {product.badge}
            </span>
          </div>
        )}
        {isOutOfStock && (
          <div className="absolute bottom-2 left-2 rounded-full bg-error-container px-3 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-on-error-container">
            Rupture de stock
          </div>
        )}
      </Link>
      <div className="space-y-1">
        <p className="text-label-sm font-bold uppercase tracking-wider text-secondary">{product.brand}</p>
        <Link to={`/produit/${product.id}`} className="block truncate text-label-md font-semibold text-on-surface hover:text-primary">{product.name}</Link>
        <div className="flex items-center gap-1 text-tertiary" aria-label={`${product.rating} étoiles sur 5`}>
          {Array.from({ length: 5 }).map((_, index) => {
            const icon = index < fullStars ? 'star' : index === fullStars && hasHalfStar ? 'star_half' : 'star_border';
            return <Icon key={index} name={icon} filled={icon !== 'star_border'} className="text-[14px]" />;
          })}
          <span className="ml-1 text-[10px] font-bold text-on-surface-variant">({product.reviews})</span>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 border-t border-surface-variant pt-3">
          <div className="flex flex-col">
            {product.oldPrice && <span className="text-xs text-on-surface-variant line-through">{formatPrice(product.oldPrice)}</span>}
            <span className="text-label-md font-semibold text-primary">{formatPrice(product.price)}</span>
          </div>
          <button
            aria-label={`Ajouter ${product.name} au panier`}
            disabled={isOutOfStock}
            onClick={() => onAddToCart(product)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-highest text-primary transition-colors hover:bg-primary hover:text-on-primary disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:bg-surface-container-highest disabled:hover:text-primary"
          >
            <Icon name={isOutOfStock ? 'block' : 'add'} className="text-[18px]" />
          </button>
        </div>
      </div>
    </article>
  );
}
