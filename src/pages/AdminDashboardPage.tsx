import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BackOfficeShell } from '../components/BackOfficeShell';
import { apiFetch } from '../lib/api';
import { formatPrice } from '../lib/currency';
import type { ApiInventoryItem, ApiOrder, ApiProduct } from '../types/api';

type Snapshot = { products: ApiProduct[]; orders: ApiOrder[]; inventory: ApiInventoryItem[] };

export default function AdminDashboardPage() {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<ApiProduct[]>('/admin/products'),
      apiFetch<ApiOrder[]>('/admin/orders'),
      apiFetch<ApiInventoryItem[]>('/admin/inventory'),
    ]).then(([products, orders, inventory]) => setSnapshot({ products, orders, inventory })).catch((reason: Error) => setError(reason.message));
  }, []);

  const lowStock = snapshot?.inventory.filter((item) => item.quantity <= item.reorderLevel || item.quantity <= 5) ?? [];
  const todaySales = snapshot?.orders.filter((order) => order.status !== 'CANCELLED').reduce((total, order) => total + Number(order.total), 0) ?? 0;

  return <BackOfficeShell title="Vue d’ensemble">
    {error ? <p className="border border-error-container bg-error-container p-4 text-on-error-container">{error}</p> : !snapshot ? <p className="py-12 text-on-surface-variant">Chargement des indicateurs...</p> : <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Produits actifs" value={snapshot.products.filter((product) => product.isActive).length.toString()} link="/admin/produits" /><Metric label="Commandes" value={snapshot.orders.length.toString()} link="/admin/commandes" /><Metric label="Stock à surveiller" value={lowStock.length.toString()} link="/admin/stock" warning={lowStock.length > 0} /><Metric label="Valeur commandes" value={formatPrice(todaySales)} link="/admin/commandes" /></div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_1fr]"><section className="border border-outline-variant bg-surface"><div className="flex items-center justify-between border-b border-outline-variant px-5 py-4"><h2 className="font-display text-headline-md text-primary">Commandes récentes</h2><Link className="text-label-sm font-bold uppercase tracking-widest text-primary" to="/admin/commandes">Tout voir</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary"><tr><th className="p-4">N°</th><th className="p-4">Client</th><th className="p-4">Statut</th><th className="p-4 text-right">Total</th></tr></thead><tbody>{snapshot.orders.slice(0, 6).map((order) => <tr key={order.id} className="border-t border-outline-variant"><td className="p-4 font-semibold">{order.orderNumber}</td><td className="p-4">{order.recipientName}</td><td className="p-4">{order.status}</td><td className="p-4 text-right text-primary">{formatPrice(order.total)}</td></tr>)}</tbody></table></div></section><section className="border border-outline-variant bg-surface"><div className="flex items-center justify-between border-b border-outline-variant px-5 py-4"><h2 className="font-display text-headline-md text-primary">Stock à surveiller</h2><Link className="text-label-sm font-bold uppercase tracking-widest text-primary" to="/admin/stock">Ajuster</Link></div><div className="divide-y divide-outline-variant">{lowStock.length ? lowStock.slice(0, 6).map((item) => <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="font-semibold">{item.product.name}</p><p className="text-sm text-on-surface-variant">{item.product.brand.name}</p></div><span className="border border-error-container bg-error-container px-2 py-1 text-sm font-semibold text-on-error-container">{item.quantity}</span></div>) : <p className="p-5 text-on-surface-variant">Aucun seuil atteint.</p>}</div></section></div>
    </>}
  </BackOfficeShell>;
}

function Metric({ label, value, link, warning = false }: { label: string; value: string; link: string; warning?: boolean }) {
  return <Link to={link} className="border border-outline-variant bg-surface p-5 transition hover:border-primary-container"><p className="text-label-sm font-bold uppercase tracking-widest text-secondary">{label}</p><p className={`mt-3 font-display text-headline-lg ${warning ? 'text-error' : 'text-primary'}`}>{value}</p></Link>;
}
