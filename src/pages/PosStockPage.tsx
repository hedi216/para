import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { PosPageHeader } from '../components/pos/PosPageHeader';
import { PosShell } from '../components/pos/PosShell';
import { ApiError, apiFetch } from '../lib/api';
import type { ApiInventoryItem } from '../types/api';

export default function PosStockPage() {
  const [search, setSearch] = useState('');
  const [inventory, setInventory] = useState<ApiInventoryItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const selectedItem = useMemo(() => inventory.find((item) => item.id === selectedId) ?? inventory[0], [inventory, selectedId]);

  const loadStock = async (value = search) => {
    setIsLoading(true);
    try {
      const items = await apiFetch<ApiInventoryItem[]>(`/pos/stock${value.trim() ? `?search=${encodeURIComponent(value.trim())}` : ''}`);
      setInventory(items);
      setSelectedId((current) => (items.some((item) => item.id === current) ? current : items[0]?.id ?? ''));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Stock POS indisponible.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadStock('');
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadStock(search);
  };

  const submitAdjustment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedItem || isSaving) return;
    setMessage(null);
    setIsSaving(true);
    try {
      await apiFetch('/pos/stock/adjust', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedItem.product.id,
          quantity: Number(quantity),
          reason,
        }),
      });
      setQuantity('');
      setReason('');
      setMessage({ type: 'success', text: 'Stock ajusté et mouvement enregistré.' });
      await loadStock(search);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Ajustement impossible.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PosShell>
      <PosPageHeader title="Gestion stock">
        <form onSubmit={submitSearch} className="relative w-full sm:w-[320px]">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[22px] text-outline" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Produit, marque, SKU..."
            className="min-h-10 w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 text-sm outline-none focus:border-primary"
          />
        </form>
      </PosPageHeader>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
        {message && (
          <div
            className={`mb-4 rounded-lg border p-3 text-sm ${
              message.type === 'error'
                ? 'border-error-container bg-error-container text-on-error-container'
                : 'border-primary-container bg-secondary-container/60 text-on-primary-container'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
            <div className="border-b border-outline-variant px-4 py-3">
              <h2 className="font-display text-headline-md text-primary">Stock magasin</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary">
                  <tr>
                    <th className="p-4">Produit</th>
                    <th className="p-4">Marque</th>
                    <th className="p-4 text-right">Stock actuel</th>
                    <th className="p-4 text-right">Réservé</th>
                    <th className="p-4 text-right">Seuil faible</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td className="p-6 text-on-surface-variant" colSpan={6}>Chargement du stock...</td></tr>
                  ) : inventory.length ? (
                    inventory.map((item) => {
                      const available = item.quantity - item.reserved;
                      const low = available <= 0 || available <= item.reorderLevel || available <= 5;
                      return (
                        <tr key={item.id} className="border-t border-outline-variant">
                          <td className="p-4 font-semibold text-on-surface">{item.product.name}</td>
                          <td className="p-4 text-on-surface-variant">{item.product.brand.name}</td>
                          <td className={`p-4 text-right font-bold ${low ? 'text-error' : 'text-primary'}`}>{available}</td>
                          <td className="p-4 text-right">{item.reserved}</td>
                          <td className="p-4 text-right">{item.reorderLevel}</td>
                          <td className="p-4 text-right">
                            <button type="button" onClick={() => setSelectedId(item.id)} className="rounded-lg border border-outline-variant px-3 py-2 font-semibold text-on-surface">
                              Ajuster
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td className="p-6 text-on-surface-variant" colSpan={6}>Aucun produit trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <form onSubmit={submitAdjustment} className="h-fit rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <h2 className="font-display text-headline-md text-primary">Ajuster</h2>
            {selectedItem ? (
              <>
                <div className="mt-4 rounded-lg bg-surface-container-low p-3">
                  <p className="font-semibold text-on-surface">{selectedItem.product.name}</p>
                  <p className="text-sm text-on-surface-variant">{selectedItem.product.brand.name}</p>
                  <p className="mt-2 text-sm">Stock actuel: <span className="font-bold text-primary">{selectedItem.quantity - selectedItem.reserved}</span></p>
                </div>

                <label className="mt-4 block text-sm font-semibold text-on-surface">
                  Variation
                  <input
                    required
                    type="number"
                    value={quantity}
                    onChange={(event) => setQuantity(event.target.value)}
                    placeholder="Ex. 6 ou -2"
                    className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary"
                  />
                </label>

                <label className="mt-4 block text-sm font-semibold text-on-surface">
                  Motif obligatoire
                  <textarea
                    required
                    minLength={3}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Ex. Réception fournisseur, correction inventaire..."
                    className="mt-2 min-h-24 w-full rounded-lg border border-outline-variant bg-surface px-3 py-3 font-normal outline-none focus:border-primary"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-on-primary disabled:opacity-50"
                >
                  <Icon name="save" className="text-[20px]" />
                  {isSaving ? 'Enregistrement...' : 'Enregistrer le mouvement'}
                </button>
                <p className="mt-3 text-xs text-on-surface-variant">Accessible aux rôles EMPLOYEE et ADMIN en v1. Des permissions fines seront ajoutées plus tard.</p>
              </>
            ) : (
              <p className="mt-4 rounded-lg border border-dashed border-outline-variant p-5 text-sm text-on-surface-variant">Sélectionnez un produit.</p>
            )}
          </form>
        </div>
      </div>
    </PosShell>
  );
}
