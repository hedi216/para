import { FormEvent, KeyboardEvent, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PosShell } from '../components/pos/PosShell';
import { PrintableTicket } from '../components/pos/PosPrintDocuments';
import { useAuth } from '../contexts/auth-context';
import type { Product } from '../data/catalog';
import { ApiError, apiFetch, createIdempotencyKey } from '../lib/api';
import { mapApiProduct } from '../lib/catalog';
import { formatPrice } from '../lib/currency';
import type { ApiPosSale, ApiProduct } from '../types/api';

type SaleLine = Product & { quantity: number };
type PaymentChoice = 'CASH' | 'CARD';

const categoryFilters = [
  { id: 'all', label: 'Tous' },
  { id: 'visage', label: 'Visage' },
  { id: 'solaire', label: 'Solaire' },
  { id: 'corps-bain', label: 'Corps' },
  { id: 'cheveux', label: 'Cheveux' },
];

export default function PosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentChoice>('CASH');
  const [sales, setSales] = useState<ApiPosSale[]>([]);
  const [lastSale, setLastSale] = useState<ApiPosSale | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [isFinalizing, setIsFinalizing] = useState(false);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const loyaltyDiscount = 0;
  const total = subtotal - loyaltyDiscount;
  const filteredProducts = useMemo(
    () => products.filter((product) => activeCategory === 'all' || product.category === activeCategory),
    [products, activeCategory],
  );

  const employeeName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Employé LOLA';

  const loadProducts = async (value = search) => {
    setIsLoadingProducts(true);
    try {
      const response = await apiFetch<ApiProduct[]>(`/pos/products${value.trim() ? `?search=${encodeURIComponent(value.trim())}` : ''}`);
      setProducts(response.map(mapApiProduct));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Catalogue POS indisponible.' });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const loadSales = () => apiFetch<ApiPosSale[]>('/pos/sales').then(setSales).catch(() => undefined);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadProducts(search);
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    void loadSales();
  }, []);

  const addProduct = (product: Product) => {
    if (product.stock <= 0) {
      setMessage({ type: 'error', text: `${product.name} est en rupture de stock.` });
      return;
    }

    setMessage(null);
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (!existing) return [...current, { ...product, quantity: 1 }];
      if (existing.quantity >= product.stock) {
        setMessage({ type: 'error', text: `Stock insuffisant pour ${product.name}.` });
        return current;
      }
      return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    });
  };

  const updateQuantity = (id: string, quantity: number) =>
    setCart((current) =>
      current.flatMap((item) => {
        if (item.id !== id) return [item];
        if (quantity <= 0) return [];
        if (quantity > item.stock) {
          setMessage({ type: 'error', text: `Stock insuffisant pour ${item.name}.` });
          return [item];
        }
        return [{ ...item, quantity }];
      }),
    );

  const removeLine = (id: string) => setCart((current) => current.filter((item) => item.id !== id));

  const resetTransaction = () => {
    setCart([]);
    setPaymentMethod('CASH');
    setLastSale(null);
    setMessage({ type: 'info', text: 'Nouvelle transaction prête.' });
  };

  const scanBarcode = async () => {
    const barcode = search.trim();
    if (!barcode) return;

    setIsLoadingProducts(true);
    try {
      const product = await apiFetch<ApiProduct>(`/pos/products/barcode/${encodeURIComponent(barcode)}`);
      const mappedProduct = mapApiProduct(product);
      addProduct(mappedProduct);
      setSearch('');
      setMessage({ type: 'success', text: `${mappedProduct.name} ajouté au ticket.` });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Code-barres introuvable.' });
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void scanBarcode();
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void scanBarcode();
    }
  };

  const finalizeSale = async () => {
    if (!cart.length || isFinalizing) return;
    setMessage(null);
    setIsFinalizing(true);
    try {
      const sale = await apiFetch<ApiPosSale>('/pos/sales', {
        method: 'POST',
        body: JSON.stringify({
          idempotencyKey: createIdempotencyKey('pos-sale'),
          registerId: 'CAISSE-01',
          paymentMethod,
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });
      setCart([]);
      setSearch('');
      setLastSale(sale);
      setMessage({ type: 'success', text: `Ticket ${sale.receiptNumber} encaissé avec succès.` });
      await Promise.all([loadProducts(''), loadSales()]);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Vente impossible.' });
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <>
      <div className="print:hidden">
        <PosShell onNewTransaction={resetTransaction}>
          <header className="flex min-h-20 shrink-0 flex-col gap-4 border-b border-outline-variant bg-surface-container-lowest px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full max-w-[840px]">
              <Icon name="search" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[27px] text-outline" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Rechercher ou scanner un produit (code-barres)..."
                className="min-h-14 w-full rounded-lg border border-outline-variant bg-surface-container-lowest pl-12 pr-4 text-base text-on-surface shadow-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </form>

            <div className="flex shrink-0 items-center justify-between gap-4 md:justify-end">
              <button type="button" title="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container">
                <Icon name="notifications" className="text-[25px]" />
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-error" />
              </button>
              <div className="h-10 w-px bg-outline-variant" />
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 overflow-hidden rounded-full bg-secondary-container shadow-sm">
                  <img
                    alt=""
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAfOOuZP8t-uIApCLdfdNg7vBnhHJ57DGSGth8ebkEiqVG_EBV-8GU_ApPeya_sTCeLAi_6XJ2VXjvoFlR6GqiQW6t32ODHdwrCFxTC5NkWeqyoOd96VJQHvdLtoCYYAIEpXBgo8u7k0CwHX9yRl4YTXXZlN5-AVFZMRHQy459lWWGXzRWdyW22zIdaWz0P2KCnGjSWMERGdc_XAWvEPCq_E88e7loeyxtwcppcAZ0B2olCz-dr0l05"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold tracking-[0.08em] text-on-surface">{employeeName}</p>
                  <p className="text-[11px] leading-tight text-on-surface-variant">Caisse 01</p>
                </div>
              </div>
            </div>
          </header>

          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
            <section className="min-w-0 flex-1 p-4 md:p-6 lg:overflow-y-auto">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {categoryFilters.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveCategory(category.id)}
                    className={`min-h-11 shrink-0 rounded-full px-5 text-sm font-semibold tracking-[0.05em] transition ${
                      activeCategory === category.id
                        ? 'bg-primary-container/20 text-on-primary-container'
                        : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-highest'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {message && (
                <div
                  className={`mt-4 flex flex-col gap-3 rounded-lg border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${
                    message.type === 'error'
                      ? 'border-error-container bg-error-container text-on-error-container'
                      : 'border-primary-container bg-secondary-container/60 text-on-primary-container'
                  }`}
                >
                  <span>{message.text}</span>
                  {lastSale && message.type === 'success' && (
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary"
                    >
                      <Icon name="print" className="text-[20px]" />
                      Imprimer ticket
                    </button>
                  )}
                </div>
              )}

              <div className="mt-8">
                {isLoadingProducts ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="h-[305px] animate-pulse rounded-xl border border-outline-variant bg-surface-container-lowest p-3">
                        <div className="aspect-square rounded-lg bg-surface-container" />
                        <div className="mt-4 h-3 w-1/2 rounded bg-surface-container" />
                        <div className="mt-3 h-4 w-4/5 rounded bg-surface-container" />
                        <div className="mt-8 h-7 w-2/3 rounded bg-surface-container" />
                      </div>
                    ))}
                  </div>
                ) : filteredProducts.length ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
                    {filteredProducts.map((product) => (
                      <ProductTile key={product.id} product={product} onAdd={addProduct} />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-outline-variant bg-surface-container-lowest p-8 text-center text-on-surface-variant">
                    Aucun produit trouvé pour cette recherche.
                  </div>
                )}
              </div>
            </section>

            <TicketPanel
              cart={cart}
              subtotal={subtotal}
              loyaltyDiscount={loyaltyDiscount}
              total={total}
              paymentMethod={paymentMethod}
              isFinalizing={isFinalizing}
              recentSales={sales}
              lastSale={lastSale}
              onPaymentChange={setPaymentMethod}
              onQuantityChange={updateQuantity}
              onRemoveLine={removeLine}
              onFinalize={finalizeSale}
              onPrintLastSale={() => window.print()}
              onCustomerLookup={() => navigate('/pos/customers')}
            />
          </div>
        </PosShell>
      </div>
      <PrintableTicket sale={lastSale} />
    </>
  );
}

function ProductTile({ product, onAdd }: { product: Product; onAdd: (product: Product) => void }) {
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock <= 0;

  return (
    <article className="group flex min-h-[305px] flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-3 transition hover:border-primary/50 hover:shadow-[0_4px_12px_rgba(45,71,57,0.08)]">
      <button type="button" onClick={() => onAdd(product)} disabled={isOutOfStock} className="flex flex-1 flex-col text-left disabled:cursor-not-allowed">
        <div className="relative mb-3 aspect-square overflow-hidden rounded-lg bg-surface-container-low">
          <img src={product.image} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
          <div
            className={`absolute right-2 top-2 rounded px-2 py-0.5 text-[10px] font-bold shadow-sm backdrop-blur-sm ${
              isOutOfStock || isLowStock ? 'bg-error-container text-on-error-container' : 'bg-surface-container-lowest/90 text-tertiary'
            }`}
          >
            Stock: {product.stock}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between">
          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">{product.brand}</p>
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-on-surface">{product.name}</h3>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <span className="font-display text-[24px] leading-none text-primary">
              {formatPrice(product.price).replace(' DT', '')}
              <span className="ml-0.5 text-xs font-sans">DT</span>
            </span>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary transition group-hover:bg-primary group-hover:text-on-primary">
              <Icon name={isOutOfStock ? 'block' : 'add'} className="text-[20px]" />
            </span>
          </div>
        </div>
      </button>
    </article>
  );
}

function TicketPanel({
  cart,
  subtotal,
  loyaltyDiscount,
  total,
  paymentMethod,
  isFinalizing,
  recentSales,
  lastSale,
  onPaymentChange,
  onQuantityChange,
  onRemoveLine,
  onFinalize,
  onPrintLastSale,
  onCustomerLookup,
}: {
  cart: SaleLine[];
  subtotal: number;
  loyaltyDiscount: number;
  total: number;
  paymentMethod: PaymentChoice;
  isFinalizing: boolean;
  recentSales: ApiPosSale[];
  lastSale: ApiPosSale | null;
  onPaymentChange: (method: PaymentChoice) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onRemoveLine: (id: string) => void;
  onFinalize: () => void;
  onPrintLastSale: () => void;
  onCustomerLookup: () => void;
}) {
  return (
    <aside className="flex shrink-0 flex-col border-t border-outline-variant bg-surface-container-lowest shadow-[-4px_0_24px_rgba(45,71,57,0.03)] lg:w-[400px] lg:border-l lg:border-t-0">
      <div className="border-b border-outline-variant p-4">
        <button
          type="button"
          onClick={onCustomerLookup}
          className="group flex min-h-16 w-full items-center justify-between rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 py-3 transition hover:bg-secondary-container"
        >
          <span className="flex items-center gap-3">
            <Icon name="person_add" className="text-[25px] text-primary" />
            <span className="text-sm font-semibold text-on-surface">Associer un client</span>
          </span>
          <Icon name="chevron_right" className="text-[24px] text-on-surface-variant transition group-hover:text-primary" />
        </button>
      </div>

      <div className="min-h-[220px] flex-1 space-y-3 overflow-y-auto p-4 lg:min-h-0">
        {cart.length ? (
          cart.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-lg border border-outline-variant/50 bg-surface p-3">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded bg-surface-container">
                <img src={item.image} alt="" className="h-full w-full object-contain mix-blend-multiply" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col justify-between">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="line-clamp-2 text-sm font-semibold leading-tight text-on-surface">{item.name}</h4>
                  <button type="button" title="Supprimer" onClick={() => onRemoveLine(item.id)} className="text-on-surface-variant transition hover:text-error">
                    <Icon name="delete" className="text-[18px]" />
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between gap-3">
                  <div className="flex items-center overflow-hidden rounded-md border border-outline-variant bg-surface-container">
                    <button type="button" onClick={() => onQuantityChange(item.id, item.quantity - 1)} className="flex h-9 w-9 items-center justify-center text-on-surface transition hover:bg-surface-container-highest">
                      <Icon name="remove" className="text-[16px]" />
                    </button>
                    <span className="min-w-8 px-2 text-center text-sm font-semibold">{item.quantity}</span>
                    <button type="button" onClick={() => onQuantityChange(item.id, item.quantity + 1)} className="flex h-9 w-9 items-center justify-center text-on-surface transition hover:bg-surface-container-highest">
                      <Icon name="add" className="text-[16px]" />
                    </button>
                  </div>
                  <span className="whitespace-nowrap text-sm font-semibold text-on-surface">{formatPrice(item.price * item.quantity)}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex h-full min-h-[180px] items-center justify-center rounded-lg border border-dashed border-outline-variant bg-surface-container-low p-6 text-center text-sm text-on-surface-variant">
            Ajoutez des articles pour démarrer une vente.
          </div>
        )}

        {lastSale && (
          <div className="rounded-lg border border-primary-container bg-secondary-container/70 p-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-primary">Ticket prêt</p>
            <p className="mt-1 text-sm font-semibold text-on-surface">{lastSale.receiptNumber}</p>
            <button
              type="button"
              onClick={onPrintLastSale}
              className="mt-3 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary"
            >
              <Icon name="print" className="text-[20px]" />
              Imprimer ticket
            </button>
          </div>
        )}

        {recentSales.length > 0 && (
          <p className="pt-1 text-[11px] text-on-surface-variant">Dernier ticket : {recentSales[0].receiptNumber}</p>
        )}
      </div>

      <div className="border-t border-outline-variant bg-surface-container-low p-4 md:p-6">
        <div className="mb-4 space-y-2">
          <div className="flex justify-between text-sm text-on-surface-variant">
            <span>Sous-total ({cart.length} article{cart.length > 1 ? 's' : ''})</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-tertiary">
            <span>Remise fidélité</span>
            <span>- {formatPrice(loyaltyDiscount)}</span>
          </div>
          <div className="flex justify-between border-t border-outline-variant/50 pt-2 text-sm text-on-surface-variant">
            <span>TVA 19% incluse</span>
            <span>Inclus</span>
          </div>
        </div>

        <div className="mb-6 flex items-end justify-between gap-4">
          <span className="text-sm font-semibold uppercase tracking-wider text-on-surface">Total</span>
          <span className="text-right font-display text-[44px] font-bold leading-none tracking-normal text-primary">
            {formatPrice(total).replace(' DT', '')}
            <span className="ml-1 text-lg font-normal">DT</span>
          </span>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <PaymentButton method="CASH" active={paymentMethod === 'CASH'} icon="payments" label="Espèces" onClick={onPaymentChange} />
          <PaymentButton method="CARD" active={paymentMethod === 'CARD'} icon="credit_card" label="Carte" onClick={onPaymentChange} />
        </div>

        <button
          type="button"
          disabled={!cart.length || isFinalizing}
          onClick={onFinalize}
          className="flex min-h-16 w-full items-center justify-center gap-2 rounded-xl bg-primary text-lg font-semibold text-on-primary shadow-md transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Icon name="check_circle" className="text-[28px]" />
          {isFinalizing ? 'Encaissement...' : 'Encaisser'}
        </button>
      </div>
    </aside>
  );
}

function PaymentButton({
  method,
  active,
  icon,
  label,
  onClick,
}: {
  method: PaymentChoice;
  active: boolean;
  icon: string;
  label: string;
  onClick: (method: PaymentChoice) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(method)}
      className={`flex min-h-14 items-center justify-center gap-2 rounded-lg border-2 bg-surface text-sm font-semibold transition ${
        active ? 'border-primary bg-primary-container/10 text-primary' : 'border-secondary-container text-on-surface hover:border-primary hover:bg-primary-container/10'
      }`}
    >
      <Icon name={icon} className="text-[22px]" />
      {label}
    </button>
  );
}
