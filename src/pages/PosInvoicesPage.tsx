import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PosPageHeader } from '../components/pos/PosPageHeader';
import { PrintableInvoice } from '../components/pos/PosPrintDocuments';
import { PosShell } from '../components/pos/PosShell';
import { ApiError, apiFetch } from '../lib/api';
import { formatPrice } from '../lib/currency';
import type { ApiPosInvoice, ApiPosSale } from '../types/api';

type InvoiceForm = {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  taxIdentifier: string;
  notes: string;
};

const emptyForm: InvoiceForm = {
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  taxIdentifier: '',
  notes: '',
};

function paymentLabel(method: string) {
  if (method === 'CASH') return 'Espèces';
  if (method === 'CARD') return 'Carte';
  return method;
}

export default function PosInvoicesPage() {
  const [searchParams] = useSearchParams();
  const requestedSaleId = searchParams.get('saleId');
  const [sales, setSales] = useState<ApiPosSale[]>([]);
  const [invoices, setInvoices] = useState<ApiPosInvoice[]>([]);
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<ApiPosInvoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<ApiPosInvoice | null>(null);
  const [form, setForm] = useState<InvoiceForm>(emptyForm);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const convertibleSales = useMemo(
    () => sales.filter((sale) => sale.status === 'COMPLETED' && !sale.invoice),
    [sales],
  );
  const selectedSale = useMemo(() => sales.find((sale) => sale.id === selectedSaleId) ?? null, [sales, selectedSaleId]);

  const selectSale = (sale: ApiPosSale) => {
    setSelectedSaleId(sale.id);
    setSelectedInvoice(null);
    const user = sale.customer?.user;
    setForm({
      customerName: user ? `${user.firstName} ${user.lastName}`.trim() : '',
      customerPhone: user?.phone ?? '',
      customerAddress: '',
      taxIdentifier: '',
      notes: '',
    });
  };

  const loadData = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      const [salesResponse, invoicesResponse] = await Promise.all([
        apiFetch<ApiPosSale[]>('/pos/sales'),
        apiFetch<ApiPosInvoice[]>('/pos/invoices'),
      ]);
      setSales(salesResponse);
      setInvoices(invoicesResponse);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Factures POS indisponibles.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  useEffect(() => {
    if (!requestedSaleId || !sales.length || selectedSaleId) return;
    const sale = sales.find((item) => item.id === requestedSaleId);
    const invoice = invoices.find((item) => item.posSaleId === requestedSaleId);
    if (sale && !sale.invoice) {
      selectSale(sale);
    } else if (invoice) {
      setSelectedInvoice(invoice);
      setMessage({ type: 'info', text: 'Ce ticket possède déjà une facture interne.' });
    }
  }, [requestedSaleId, sales, invoices, selectedSaleId]);

  const submitInvoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedSale || isSaving) return;
    setIsSaving(true);
    setMessage(null);
    try {
      const invoice = await apiFetch<ApiPosInvoice>('/pos/invoices', {
        method: 'POST',
        body: JSON.stringify({
          posSaleId: selectedSale.id,
          customerName: form.customerName,
          customerPhone: form.customerPhone,
          customerAddress: form.customerAddress,
          taxIdentifier: form.taxIdentifier || undefined,
          notes: form.notes || undefined,
        }),
      });
      setSelectedInvoice(invoice);
      setPrintInvoice(invoice);
      setSelectedSaleId('');
      setForm(emptyForm);
      setMessage({ type: 'success', text: `Facture interne ${invoice.invoiceNumber} créée.` });
      await loadData();
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Création de facture impossible.' });
    } finally {
      setIsSaving(false);
    }
  };

  const printSelectedInvoice = (invoice: ApiPosInvoice) => {
    setPrintInvoice(invoice);
    window.setTimeout(() => window.print(), 50);
  };

  return (
    <>
      <div className="print:hidden">
        <PosShell>
          <PosPageHeader title="Factures">
            <button
              type="button"
              onClick={() => void loadData()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 text-sm font-semibold text-on-surface"
            >
              <Icon name="refresh" className="text-[20px]" />
              Actualiser
            </button>
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

            <div className="mb-5 rounded-xl border border-outline-variant bg-surface-container-lowest p-4 text-sm text-on-surface-variant">
              Les documents générés ici sont des factures internes / proforma v1 depuis les tickets POS. La facture fiscale officielle devra être validée juridiquement et techniquement plus tard.
            </div>

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
              <div className="space-y-5">
                <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                  <div className="border-b border-outline-variant px-4 py-3">
                    <h2 className="font-display text-headline-md text-primary">Tickets convertibles</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary">
                        <tr>
                          <th className="p-4">Ticket</th>
                          <th className="p-4">Date</th>
                          <th className="p-4">Paiement</th>
                          <th className="p-4 text-right">Total</th>
                          <th className="p-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoading ? (
                          <tr><td className="p-6 text-on-surface-variant" colSpan={5}>Chargement...</td></tr>
                        ) : convertibleSales.length ? (
                          convertibleSales.map((sale) => (
                            <tr key={sale.id} className="border-t border-outline-variant">
                              <td className="p-4 font-semibold">{sale.receiptNumber}</td>
                              <td className="p-4 text-on-surface-variant">{new Date(sale.createdAt).toLocaleString('fr-FR')}</td>
                              <td className="p-4">{paymentLabel(sale.paymentMethod)}</td>
                              <td className="p-4 text-right font-semibold">{formatPrice(sale.total)}</td>
                              <td className="p-4 text-right">
                                <button type="button" onClick={() => selectSale(sale)} className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary">
                                  Créer facture
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td className="p-6 text-on-surface-variant" colSpan={5}>Aucun ticket convertible.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                  <div className="border-b border-outline-variant px-4 py-3">
                    <h2 className="font-display text-headline-md text-primary">Factures créées</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary">
                        <tr>
                          <th className="p-4">Facture</th>
                          <th className="p-4">Client</th>
                          <th className="p-4">Ticket</th>
                          <th className="p-4 text-right">Total</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoices.length ? (
                          invoices.map((invoice) => (
                            <tr key={invoice.id} className="border-t border-outline-variant">
                              <td className="p-4 font-semibold">{invoice.invoiceNumber}</td>
                              <td className="p-4">{invoice.customerName}</td>
                              <td className="p-4 text-on-surface-variant">{invoice.posSale.receiptNumber}</td>
                              <td className="p-4 text-right font-semibold">{formatPrice(invoice.total)}</td>
                              <td className="p-4">
                                <div className="flex justify-end gap-2">
                                  <button type="button" onClick={() => setSelectedInvoice(invoice)} className="rounded-lg border border-outline-variant px-3 py-2 font-semibold text-on-surface">Voir</button>
                                  <button type="button" onClick={() => printSelectedInvoice(invoice)} className="rounded-lg bg-primary px-3 py-2 font-semibold text-on-primary">Imprimer</button>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr><td className="p-6 text-on-surface-variant" colSpan={5}>Aucune facture interne créée.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              <aside className="space-y-5">
                <form onSubmit={submitInvoice} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                  <h2 className="font-display text-headline-md text-primary">Créer facture</h2>
                  {selectedSale ? (
                    <>
                      <div className="mt-4 rounded-lg bg-surface-container-low p-3 text-sm">
                        <p className="font-semibold">{selectedSale.receiptNumber}</p>
                        <p className="text-on-surface-variant">{new Date(selectedSale.createdAt).toLocaleString('fr-FR')}</p>
                        <p className="font-semibold text-primary">{formatPrice(selectedSale.total)}</p>
                      </div>
                      <label className="mt-4 block text-sm font-semibold">
                        Nom client / société
                        <input required value={form.customerName} onChange={(event) => setForm({ ...form, customerName: event.target.value })} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                      </label>
                      <label className="mt-4 block text-sm font-semibold">
                        Téléphone
                        <input required value={form.customerPhone} onChange={(event) => setForm({ ...form, customerPhone: event.target.value })} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                      </label>
                      <label className="mt-4 block text-sm font-semibold">
                        Adresse
                        <input required value={form.customerAddress} onChange={(event) => setForm({ ...form, customerAddress: event.target.value })} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                      </label>
                      <label className="mt-4 block text-sm font-semibold">
                        Matricule fiscal optionnel
                        <input value={form.taxIdentifier} onChange={(event) => setForm({ ...form, taxIdentifier: event.target.value })} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                      </label>
                      <label className="mt-4 block text-sm font-semibold">
                        Notes
                        <textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-2 min-h-24 w-full rounded-lg border border-outline-variant bg-surface px-3 py-3 font-normal outline-none focus:border-primary" />
                      </label>
                      <button type="submit" disabled={isSaving} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-on-primary disabled:opacity-50">
                        <Icon name="contract" className="text-[20px]" />
                        {isSaving ? 'Création...' : 'Générer facture interne'}
                      </button>
                    </>
                  ) : (
                    <p className="mt-4 rounded-lg border border-dashed border-outline-variant p-5 text-sm text-on-surface-variant">Choisissez un ticket convertible pour créer une facture interne.</p>
                  )}
                </form>

                <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                  <h2 className="font-display text-headline-md text-primary">Aperçu</h2>
                  {selectedInvoice ? (
                    <div className="mt-4 space-y-3 text-sm">
                      <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
                      <p>{selectedInvoice.customerName}</p>
                      <p className="text-on-surface-variant">{selectedInvoice.customerAddress}</p>
                      <div className="flex justify-between border-t border-outline-variant pt-3 text-lg font-bold text-primary">
                        <span>Total</span>
                        <span>{formatPrice(selectedInvoice.total)}</span>
                      </div>
                      <button type="button" onClick={() => printSelectedInvoice(selectedInvoice)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-on-primary">
                        <Icon name="print" className="text-[20px]" />
                        Imprimer facture
                      </button>
                    </div>
                  ) : (
                    <p className="mt-4 rounded-lg border border-dashed border-outline-variant p-5 text-sm text-on-surface-variant">Aucune facture sélectionnée.</p>
                  )}
                </section>
              </aside>
            </div>
          </div>
        </PosShell>
      </div>
      <PrintableInvoice invoice={printInvoice} />
    </>
  );
}
