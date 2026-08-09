import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { PosPageHeader } from '../components/pos/PosPageHeader';
import { PosShell } from '../components/pos/PosShell';
import { useAuth } from '../contexts/auth-context';
import { ApiError, apiFetch } from '../lib/api';
import { formatPrice } from '../lib/currency';
import type { ApiBrand, ApiCategory, ApiInventoryItem, ApiProduct } from '../types/api';

type AdjustmentKind = 'ADD' | 'REMOVE' | 'CORRECTION' | 'SUPPLIER_RECEIPT' | 'LOSS' | 'CUSTOMER_RETURN';

type ProductForm = {
  name: string;
  brandId: string;
  categoryId: string;
  price: string;
  oldPrice: string;
  barcode: string;
  sku: string;
  initialStock: string;
  reorderLevel: string;
  imageUrl: string;
  description: string;
};

const emptyProductForm: ProductForm = {
  name: '',
  brandId: '',
  categoryId: '',
  price: '',
  oldPrice: '',
  barcode: '',
  sku: '',
  initialStock: '0',
  reorderLevel: '3',
  imageUrl: '',
  description: '',
};

const adjustmentOptions: Array<{ value: AdjustmentKind; label: string; sign: 'positive' | 'negative' | 'signed' }> = [
  { value: 'ADD', label: 'Ajouter du stock', sign: 'positive' },
  { value: 'REMOVE', label: 'Retirer du stock', sign: 'negative' },
  { value: 'CORRECTION', label: 'Correction inventaire', sign: 'signed' },
  { value: 'SUPPLIER_RECEIPT', label: 'Réception fournisseur', sign: 'positive' },
  { value: 'LOSS', label: 'Perte / casse', sign: 'negative' },
  { value: 'CUSTOMER_RETURN', label: 'Retour client', sign: 'positive' },
];

const fallbackImage = 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=300&q=80';

function buildStockPath(search: string, category: string) {
  const params = new URLSearchParams();
  if (search.trim()) params.set('search', search.trim());
  if (category !== 'all') params.set('category', category);
  const query = params.toString();
  return `/pos/stock${query ? `?${query}` : ''}`;
}

export default function PosStockPage() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [inventory, setInventory] = useState<ApiInventoryItem[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [adjustmentKind, setAdjustmentKind] = useState<AdjustmentKind>('ADD');
  const [quantity, setQuantity] = useState('');
  const [reasonDetail, setReasonDetail] = useState('');
  const [productForm, setProductForm] = useState<ProductForm>(emptyProductForm);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);

  const selectedItem = useMemo(() => inventory.find((item) => item.id === selectedId) ?? inventory[0], [inventory, selectedId]);
  const selectedAdjustment = adjustmentOptions.find((item) => item.value === adjustmentKind) ?? adjustmentOptions[0];

  const loadMeta = async () => {
    const [categoryItems, brandItems] = await Promise.all([
      apiFetch<ApiCategory[]>('/pos/categories'),
      apiFetch<ApiBrand[]>('/pos/brands'),
    ]);
    setCategories(categoryItems);
    setBrands(brandItems);
    setProductForm((current) => ({
      ...current,
      categoryId: current.categoryId || categoryItems[0]?.id || '',
      brandId: current.brandId || brandItems[0]?.id || '',
    }));
  };

  const loadStock = async (value = search, category = categoryFilter) => {
    setIsLoading(true);
    try {
      const items = await apiFetch<ApiInventoryItem[]>(buildStockPath(value, category));
      setInventory(items);
      setSelectedId((current) => (items.some((item) => item.id === current) ? current : items[0]?.id ?? ''));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Stock POS indisponible.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void Promise.all([loadMeta(), loadStock('', 'all')]).catch((error: Error) => {
      setMessage({ type: 'error', text: error.message });
      setIsLoading(false);
    });
  }, []);

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadStock(search, categoryFilter);
  };

  const updateCategoryFilter = (value: string) => {
    setCategoryFilter(value);
    void loadStock(search, value);
  };

  const signedQuantity = () => {
    const value = Number(quantity);
    if (selectedAdjustment.sign === 'positive') return Math.abs(value);
    if (selectedAdjustment.sign === 'negative') return -Math.abs(value);
    return value;
  };

  const submitAdjustment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedItem || isSaving) return;
    const finalQuantity = signedQuantity();
    if (!finalQuantity) {
      setMessage({ type: 'error', text: 'La quantité doit être différente de zéro.' });
      return;
    }

    setMessage(null);
    setIsSaving(true);
    try {
      await apiFetch('/pos/stock/adjust', {
        method: 'POST',
        body: JSON.stringify({
          productId: selectedItem.product.id,
          quantity: finalQuantity,
          reason: `${selectedAdjustment.label} - ${reasonDetail.trim()}`,
        }),
      });
      setQuantity('');
      setReasonDetail('');
      setMessage({ type: 'success', text: 'Stock ajusté et trace historique enregistrée.' });
      await loadStock(search, categoryFilter);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Ajustement impossible.' });
    } finally {
      setIsSaving(false);
    }
  };

  const updateProductForm = (field: keyof ProductForm, value: string) => {
    setProductForm((current) => ({ ...current, [field]: value }));
  };

  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreatingProduct) return;
    setMessage(null);
    setIsCreatingProduct(true);

    try {
      const payload = {
        name: productForm.name,
        brandId: productForm.brandId,
        categoryId: productForm.categoryId,
        price: Number(productForm.price),
        ...(productForm.oldPrice ? { oldPrice: Number(productForm.oldPrice) } : {}),
        ...(productForm.barcode.trim() ? { barcode: productForm.barcode.trim() } : {}),
        ...(productForm.sku.trim() ? { sku: productForm.sku.trim() } : {}),
        initialStock: Number(productForm.initialStock || 0),
        reorderLevel: Number(productForm.reorderLevel || 0),
        ...(productForm.imageUrl.trim() ? { imageUrl: productForm.imageUrl.trim() } : {}),
        ...(productForm.description.trim() ? { description: productForm.description.trim() } : {}),
      };
      const created = await apiFetch<ApiProduct>('/pos/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setProductForm({
        ...emptyProductForm,
        categoryId: categories[0]?.id || '',
        brandId: brands[0]?.id || '',
      });
      setSearch(created.name);
      setMessage({
        type: 'success',
        text: user?.role === 'ADMIN'
          ? `${created.name} a été créé et activé.`
          : `${created.name} a été créé avec validation admin requise avant publication web.`,
      });
      await loadStock(created.name, 'all');
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Création produit impossible.' });
    } finally {
      setIsCreatingProduct(false);
    }
  };

  return (
    <PosShell>
      <PosPageHeader title="Gestion stock">
        <form onSubmit={submitSearch} className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <select
            value={categoryFilter}
            onChange={(event) => updateCategoryFilter(event.target.value)}
            className="min-h-10 rounded-lg border border-outline-variant bg-surface px-3 text-sm outline-none focus:border-primary"
          >
            <option value="all">Toutes catégories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
          <div className="relative min-w-0 sm:w-[320px]">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[22px] text-outline" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nom, marque, SKU, code-barres..."
              className="min-h-10 w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <button type="submit" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary">
            <Icon name="barcode_scanner" className="text-[20px]" />
            Scanner code-barres
          </button>
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

        <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
            <div className="border-b border-outline-variant px-4 py-3">
              <h2 className="font-display text-headline-md text-primary">Stock magasin</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary">
                  <tr>
                    <th className="p-4">Image</th>
                    <th className="p-4">Produit</th>
                    <th className="p-4">Marque</th>
                    <th className="p-4">Catégorie</th>
                    <th className="p-4">Code-barres</th>
                    <th className="p-4">SKU</th>
                    <th className="p-4 text-right">Prix</th>
                    <th className="p-4 text-right">Stock actuel</th>
                    <th className="p-4 text-right">Seuil faible</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td className="p-6 text-on-surface-variant" colSpan={10}>Chargement du stock...</td></tr>
                  ) : inventory.length ? (
                    inventory.map((item) => {
                      const available = item.quantity - item.reserved;
                      const low = available <= 0 || available <= item.reorderLevel || available <= 5;
                      return (
                        <tr key={item.id} className="border-t border-outline-variant align-middle">
                          <td className="p-4">
                            <div className="h-12 w-12 overflow-hidden rounded-lg bg-surface-container">
                              <img src={item.product.image ?? fallbackImage} alt="" className="h-full w-full object-cover" />
                            </div>
                          </td>
                          <td className="p-4">
                            <p className="font-semibold text-on-surface">{item.product.name}</p>
                            {!item.product.isActive && <p className="mt-1 text-xs font-semibold text-error">À valider admin</p>}
                          </td>
                          <td className="p-4 text-on-surface-variant">{item.product.brand.name}</td>
                          <td className="p-4 text-on-surface-variant">{item.product.category.name}</td>
                          <td className="p-4 text-on-surface-variant">{item.product.barcode ?? '-'}</td>
                          <td className="p-4 text-on-surface-variant">{item.product.sku ?? '-'}</td>
                          <td className="p-4 text-right font-semibold">{formatPrice(item.product.price)}</td>
                          <td className={`p-4 text-right font-bold ${low ? 'text-error' : 'text-primary'}`}>{available}</td>
                          <td className="p-4 text-right">{item.reorderLevel}</td>
                          <td className="p-4 text-right">
                            <button type="button" onClick={() => setSelectedId(item.id)} className="rounded-lg border border-outline-variant px-3 py-2 font-semibold text-on-surface">
                              Ajuster stock
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td className="p-6 text-on-surface-variant" colSpan={10}>Aucun produit trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-5">
            <form onSubmit={submitAdjustment} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <h2 className="font-display text-headline-md text-primary">Ajuster stock</h2>
              <p className="mt-2 text-sm text-on-surface-variant">Ajouter ou retirer une quantité avec motif crée une trace historique.</p>
              {selectedItem ? (
                <>
                  <div className="mt-4 rounded-lg bg-surface-container-low p-3">
                    <p className="font-semibold text-on-surface">{selectedItem.product.name}</p>
                    <p className="text-sm text-on-surface-variant">{selectedItem.product.brand.name}</p>
                    <p className="mt-2 text-sm">Stock actuel : <span className="font-bold text-primary">{selectedItem.quantity - selectedItem.reserved}</span></p>
                  </div>

                  <label className="mt-4 block text-sm font-semibold text-on-surface">
                    Type d'ajustement
                    <select
                      value={adjustmentKind}
                      onChange={(event) => setAdjustmentKind(event.target.value as AdjustmentKind)}
                      className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary"
                    >
                      {adjustmentOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="mt-4 block text-sm font-semibold text-on-surface">
                    Quantité
                    <input
                      required
                      type="number"
                      value={quantity}
                      onChange={(event) => setQuantity(event.target.value)}
                      placeholder={selectedAdjustment.sign === 'signed' ? 'Ex. 6 ou -2' : 'Ex. 6'}
                      className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary"
                    />
                  </label>

                  <label className="mt-4 block text-sm font-semibold text-on-surface">
                    Motif détaillé obligatoire
                    <textarea
                      required
                      minLength={3}
                      value={reasonDetail}
                      onChange={(event) => setReasonDetail(event.target.value)}
                      placeholder="Ex. BL fournisseur, casse rayon, erreur comptage..."
                      className="mt-2 min-h-24 w-full rounded-lg border border-outline-variant bg-surface px-3 py-3 font-normal outline-none focus:border-primary"
                    />
                  </label>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-on-primary disabled:opacity-50"
                  >
                    <Icon name="save" className="text-[20px]" />
                    {isSaving ? 'Validation...' : "Valider l'ajustement"}
                  </button>
                </>
              ) : (
                <p className="mt-4 rounded-lg border border-dashed border-outline-variant p-5 text-sm text-on-surface-variant">Sélectionnez un produit.</p>
              )}
            </form>

            <form onSubmit={submitProduct} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <h2 className="font-display text-headline-md text-primary">Ajouter un produit</h2>
              <p className="mt-2 text-sm text-on-surface-variant">
                {user?.role === 'ADMIN'
                  ? 'Création active directement par admin.'
                  : 'Création comptoir à valider par admin avant publication web.'}
              </p>

              <label className="mt-4 block text-sm font-semibold">
                Nom produit
                <input required value={productForm.name} onChange={(event) => updateProductForm('name', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
              </label>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Marque
                  <select required value={productForm.brandId} onChange={(event) => updateProductForm('brandId', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary">
                    {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
                  </select>
                </label>
                <label className="block text-sm font-semibold">
                  Catégorie
                  <select required value={productForm.categoryId} onChange={(event) => updateProductForm('categoryId', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary">
                    {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
                  </select>
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Prix vente DT
                  <input required type="number" step="0.001" min="0" value={productForm.price} onChange={(event) => updateProductForm('price', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                </label>
                <label className="block text-sm font-semibold">
                  Ancien prix
                  <input type="number" step="0.001" min="0" value={productForm.oldPrice} onChange={(event) => updateProductForm('oldPrice', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Code-barres
                  <input value={productForm.barcode} onChange={(event) => updateProductForm('barcode', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                </label>
                <label className="block text-sm font-semibold">
                  SKU
                  <input value={productForm.sku} onChange={(event) => updateProductForm('sku', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                </label>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm font-semibold">
                  Stock initial
                  <input required type="number" min="0" value={productForm.initialStock} onChange={(event) => updateProductForm('initialStock', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                </label>
                <label className="block text-sm font-semibold">
                  Seuil stock faible
                  <input required type="number" min="0" value={productForm.reorderLevel} onChange={(event) => updateProductForm('reorderLevel', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                </label>
              </div>

              <label className="mt-4 block text-sm font-semibold">
                Image URL
                <input value={productForm.imageUrl} onChange={(event) => updateProductForm('imageUrl', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
              </label>

              <label className="mt-4 block text-sm font-semibold">
                Description courte
                <textarea value={productForm.description} onChange={(event) => updateProductForm('description', event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-outline-variant bg-surface px-3 py-3 font-normal outline-none focus:border-primary" />
              </label>

              <button type="submit" disabled={isCreatingProduct} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-on-primary disabled:opacity-50">
                <Icon name="add_circle" className="text-[20px]" />
                {isCreatingProduct ? 'Création...' : 'Créer le produit'}
              </button>
            </form>
          </aside>
        </div>
      </div>
    </PosShell>
  );
}
