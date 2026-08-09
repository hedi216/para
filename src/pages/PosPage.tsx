import { useEffect, useMemo, useState } from 'react';
import { BackOfficeShell } from '../components/BackOfficeShell';
import { Icon } from '../components/Icon';
import type { Product } from '../data/catalog';
import { ApiError, apiFetch, createIdempotencyKey } from '../lib/api';
import { mapApiProduct } from '../lib/catalog';
import { formatPrice } from '../lib/currency';
import type { ApiProduct } from '../types/api';

type SaleLine = Product & { quantity: number };
type PosSale = {
  id: string;
  receiptNumber: string;
  total: number | string;
  paymentMethod: string;
  createdAt: string;
  employee: { firstName: string; lastName: string };
  register?: { code: string; label: string };
};

export default function PosPage() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<SaleLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'CARD'>('CASH');
  const [sales, setSales] = useState<PosSale[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const loadProducts = () =>
    apiFetch<ApiProduct[]>(`/pos/products${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      .then((items) => setProducts(items.map(mapApiProduct)))
      .catch((error: Error) => setMessage(error.message));

  const loadSales = () => apiFetch<PosSale[]>('/pos/sales').then(setSales).catch(() => undefined);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadProducts();
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    void loadSales();
  }, []);

  const add = (product: Product) => {
    if (!product.stock) return;
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (!existing) return [...current, { ...product, quantity: 1 }];
      if (existing.quantity >= product.stock) return current;
      return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    });
  };

  const update = (id: string, quantity: number) =>
    setCart((current) => current.flatMap((item) => (item.id !== id ? [item] : quantity > 0 ? [{ ...item, quantity: Math.min(quantity, item.stock) }] : [])));

  const finalize = async () => {
    if (!cart.length) return;
    setMessage(null);
    setIsFinalizing(true);
    try {
      const sale = await apiFetch<PosSale>('/pos/sales', {
        method: 'POST',
        body: JSON.stringify({
          idempotencyKey: createIdempotencyKey('pos-sale'),
          registerId: 'CAISSE-01',
          paymentMethod,
          items: cart.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });
      setCart([]);
      setMessage(`Vente ${sale.receiptNumber} finalisee.`);
      await Promise.all([loadProducts(), loadSales()]);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'Vente impossible.');
    } finally {
      setIsFinalizing(false);
    }
  };

  return (
    <BackOfficeShell title="Caisse POS">
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <section className="min-w-0 border border-outline-variant bg-surface">
          <div className="border-b border-outline-variant p-5">
            <label className="flex items-center gap-2 border border-outline-variant bg-surface-container-lowest px-3 py-3 text-primary">
              <Icon name="search" className="text-[20px]" />
              <input
                autoFocus
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Nom, SKU ou code-barres"
                className="w-full bg-transparent text-sm text-on-surface outline-none"
              />
            </label>
          </div>
          <div className="grid max-h-[600px] grid-cols-1 overflow-y-auto sm:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => (
              <button
                key={product.id}
                onClick={() => add(product)}
                disabled={product.stock <= 0}
                className="flex gap-3 border-b border-r border-outline-variant p-4 text-left transition hover:bg-surface-container-low disabled:opacity-45"
              >
                <img src={product.image} alt="" className="h-16 w-14 object-contain mix-blend-multiply" />
                <span>
                  <span className="block text-xs font-bold uppercase tracking-wider text-secondary">{product.brand}</span>
                  <span className="mt-1 block text-sm font-semibold">{product.name}</span>
                  <span className="mt-2 block text-sm text-primary">
                    {formatPrice(product.price)} · {product.stock} en stock
                  </span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <aside className="border border-outline-variant bg-surface">
          <div className="border-b border-outline-variant p-5">
            <h2 className="font-display text-headline-md text-primary">Vente en cours</h2>
          </div>
          {message && <p className="m-4 border border-primary-container bg-secondary-container/60 p-3 text-sm text-on-primary-container">{message}</p>}
          <div className="max-h-[360px] divide-y divide-outline-variant overflow-y-auto">
            {cart.length ? (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{item.name}</p>
                    <p className="text-sm text-primary">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => update(item.id, item.quantity - 1)} title="Retirer" className="flex h-7 w-7 items-center justify-center border border-outline-variant text-primary">
                      <Icon name="remove" className="text-[16px]" />
                    </button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => update(item.id, item.quantity + 1)} title="Ajouter" className="flex h-7 w-7 items-center justify-center border border-outline-variant text-primary">
                      <Icon name="add" className="text-[16px]" />
                    </button>
                  </div>
                  <p className="w-20 text-right text-sm font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))
            ) : (
              <p className="p-6 text-sm text-on-surface-variant">Ajoutez des articles pour demarrer une vente.</p>
            )}
          </div>
          <div className="border-t border-outline-variant p-5">
            <div className="flex justify-between font-display text-headline-md text-primary">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button onClick={() => setPaymentMethod('CASH')} className={`border px-3 py-3 text-sm font-semibold ${paymentMethod === 'CASH' ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant text-primary'}`}>
                Especes
              </button>
              <button onClick={() => setPaymentMethod('CARD')} className={`border px-3 py-3 text-sm font-semibold ${paymentMethod === 'CARD' ? 'border-primary bg-primary text-on-primary' : 'border-outline-variant text-primary'}`}>
                Carte
              </button>
            </div>
            <button disabled={!cart.length || isFinalizing} onClick={finalize} className="mt-4 min-h-12 w-full bg-primary text-label-md uppercase tracking-[0.05em] text-on-primary disabled:opacity-45">
              {isFinalizing ? 'Encaissement...' : 'Finaliser la vente'}
            </button>
          </div>
        </aside>
      </div>

      <section className="mt-6 overflow-x-auto border border-outline-variant bg-surface">
        <div className="border-b border-outline-variant px-5 py-4">
          <h2 className="font-display text-headline-md text-primary">Ventes recentes</h2>
        </div>
        <table className="w-full min-w-[650px] text-left text-sm">
          <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary">
            <tr>
              <th className="p-4">Ticket</th>
              <th className="p-4">Employe</th>
              <th className="p-4">Caisse</th>
              <th className="p-4">Paiement</th>
              <th className="p-4">Date</th>
              <th className="p-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.slice(0, 10).map((sale) => (
              <tr key={sale.id} className="border-t border-outline-variant">
                <td className="p-4 font-semibold">{sale.receiptNumber}</td>
                <td className="p-4">
                  {sale.employee.firstName} {sale.employee.lastName}
                </td>
                <td className="p-4">{sale.register?.code ?? 'CAISSE-01'}</td>
                <td className="p-4">{sale.paymentMethod}</td>
                <td className="p-4">{new Date(sale.createdAt).toLocaleString('fr-TN')}</td>
                <td className="p-4 text-right text-primary">{formatPrice(sale.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </BackOfficeShell>
  );
}
