import { FormEvent, useEffect, useState } from 'react';
import { BackOfficeShell } from '../components/BackOfficeShell';
import { ApiError, apiFetch } from '../lib/api';
import type { ApiInventoryItem } from '../types/api';

export default function AdminStockPage() {
  const [inventory, setInventory] = useState<ApiInventoryItem[]>([]);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('Ajustement magasin');
  const [message, setMessage] = useState<string | null>(null);
  const load = () => apiFetch<ApiInventoryItem[]>('/admin/inventory').then((items) => { setInventory(items); setProductId((current) => current || items[0]?.product.id || ''); }).catch((error: Error) => setMessage(error.message));
  useEffect(() => { void load(); }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setMessage(null);
    try { await apiFetch('/admin/inventory/adjust', { method: 'POST', body: JSON.stringify({ productId, quantity: Number(quantity), reason }) }); setQuantity(''); setMessage('Stock mis à jour.'); await load(); } catch (error) { setMessage(error instanceof ApiError ? error.message : 'Ajustement impossible.'); }
  };

  return <BackOfficeShell title="Stock"><div className="grid gap-6 xl:grid-cols-[360px_1fr]"><form onSubmit={submit} className="h-fit border border-outline-variant bg-surface p-5"><h2 className="font-display text-headline-md text-primary">Ajuster le stock</h2><p className="mt-2 text-sm text-on-surface-variant">Une valeur positive ajoute du stock, une valeur négative le retire. Chaque modification est tracée.</p>{message && <p className="mt-4 border border-primary-container bg-secondary-container/60 p-3 text-sm text-on-primary-container">{message}</p>}<label className="mt-6 block text-sm font-semibold">Produit<select value={productId} onChange={(event) => setProductId(event.target.value)} className="mt-2 w-full border border-outline-variant bg-surface px-3 py-3 font-normal">{inventory.map((item) => <option key={item.id} value={item.product.id}>{item.product.name}</option>)}</select></label><label className="mt-4 block text-sm font-semibold">Variation<input required type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} className="mt-2 w-full border border-outline-variant px-3 py-3 font-normal" placeholder="Ex. 6 ou -2" /></label><label className="mt-4 block text-sm font-semibold">Motif<input value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 w-full border border-outline-variant px-3 py-3 font-normal" /></label><button className="mt-6 w-full bg-primary px-4 py-3 text-label-md text-on-primary">Enregistrer l’ajustement</button></form><div className="overflow-x-auto border border-outline-variant bg-surface"><table className="w-full min-w-[660px] text-left text-sm"><thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary"><tr><th className="p-4">Produit</th><th className="p-4">Marque</th><th className="p-4 text-right">Disponible</th><th className="p-4 text-right">Réservé</th><th className="p-4 text-right">Seuil</th></tr></thead><tbody>{inventory.map((item) => { const low = item.quantity <= item.reorderLevel || item.quantity <= 5; return <tr key={item.id} className="border-t border-outline-variant"><td className="p-4 font-semibold">{item.product.name}</td><td className="p-4 text-on-surface-variant">{item.product.brand.name}</td><td className={`p-4 text-right font-semibold ${low ? 'text-error' : 'text-primary'}`}>{item.quantity}</td><td className="p-4 text-right">{item.reserved}</td><td className="p-4 text-right">{item.reorderLevel}</td></tr>; })}</tbody></table></div></div></BackOfficeShell>;
}
