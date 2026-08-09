import { Link } from 'react-router-dom';
import { useCart } from '../contexts/cart-context';
import { formatPrice } from '../lib/currency';
import { Icon } from '../components/Icon';

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <section className="section-shell py-24 text-center">
        <Icon name="shopping_bag" className="text-[42px] text-primary" />
        <h1 className="mt-5 font-display text-headline-lg text-primary">Votre panier est vide</h1>
        <p className="mt-3 text-on-surface-variant">Vos essentiels parapharmacie vous attendent au catalogue.</p>
        <Link to="/catalogue" className="mt-8 inline-flex bg-primary px-6 py-3 text-label-md uppercase tracking-[0.05em] text-on-primary">Découvrir le catalogue</Link>
      </section>
    );
  }

  return (
    <section className="bg-surface-container-low py-12 md:py-20">
      <div className="section-shell grid gap-10 lg:grid-cols-[1fr_340px]">
        <div>
          <p className="text-label-sm font-bold uppercase tracking-widest text-secondary">Commande</p>
          <h1 className="mt-2 font-display text-display-lg-mobile text-primary">Votre panier</h1>
          <div className="mt-8 divide-y divide-outline-variant border-y border-outline-variant bg-surface">
            {items.map((item) => (
              <article key={item.id} className="grid grid-cols-[84px_1fr] gap-4 p-4 sm:grid-cols-[100px_1fr_auto] sm:items-center sm:gap-6 sm:p-6">
                <img src={item.image} alt="" className="h-24 w-20 object-contain mix-blend-multiply" />
                <div>
                  <p className="text-label-sm font-bold uppercase tracking-wider text-secondary">{item.brand}</p>
                  <h2 className="mt-1 text-label-md font-semibold text-on-surface">{item.name}</h2>
                  <p className="mt-2 text-primary">{formatPrice(item.price)}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Réduire la quantité" className="flex h-8 w-8 items-center justify-center border border-outline-variant text-primary"><Icon name="remove" className="text-[18px]" /></button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Augmenter la quantité" disabled={item.quantity >= item.stock} className="flex h-8 w-8 items-center justify-center border border-outline-variant text-primary disabled:opacity-35"><Icon name="add" className="text-[18px]" /></button>
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between gap-4 sm:col-span-1 sm:flex-col sm:items-end">
                  <p className="font-semibold text-primary">{formatPrice(item.price * item.quantity)}</p>
                  <button onClick={() => removeItem(item.id)} aria-label={`Retirer ${item.name}`} className="text-on-surface-variant hover:text-error"><Icon name="delete" className="text-[20px]" /></button>
                </div>
              </article>
            ))}
          </div>
        </div>
        <aside className="h-fit border border-outline-variant bg-surface p-6">
          <h2 className="font-display text-headline-md text-primary">Récapitulatif</h2>
          <div className="mt-6 flex justify-between border-b border-outline-variant pb-4 text-on-surface-variant"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div>
          <div className="mt-4 flex justify-between font-display text-headline-md text-primary"><span>Total</span><span>{formatPrice(subtotal)}</span></div>
          <p className="mt-3 text-sm text-on-surface-variant">Les frais de livraison sont calculés à l’étape suivante.</p>
          <Link to="/checkout" className="mt-6 flex min-h-12 items-center justify-center bg-primary px-4 text-label-md uppercase tracking-[0.05em] text-on-primary">Passer la commande</Link>
          <Link to="/catalogue" className="mt-4 block text-center text-label-sm font-bold uppercase tracking-widest text-primary hover:underline">Continuer mes achats</Link>
        </aside>
      </div>
    </section>
  );
}
