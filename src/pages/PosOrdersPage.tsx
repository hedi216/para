import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { PosPageHeader } from '../components/pos/PosPageHeader';
import { PrintableTicket } from '../components/pos/PosPrintDocuments';
import { PosShell } from '../components/pos/PosShell';
import { ApiError, apiFetch } from '../lib/api';
import { formatPrice } from '../lib/currency';
import type { ApiPosSale } from '../types/api';

function employeeName(sale: ApiPosSale) {
  return `${sale.employee.firstName} ${sale.employee.lastName}`.trim();
}

function paymentLabel(method: string) {
  if (method === 'CASH') return 'Espèces';
  if (method === 'CARD') return 'Carte';
  return method;
}

function statusLabel(status: string) {
  if (status === 'COMPLETED') return 'Encaissé';
  if (status === 'VOIDED') return 'Remboursé';
  return status;
}

export default function PosOrdersPage() {
  const [sales, setSales] = useState<ApiPosSale[]>([]);
  const [selectedSale, setSelectedSale] = useState<ApiPosSale | null>(null);
  const [printSale, setPrintSale] = useState<ApiPosSale | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadSales = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      setSales(await apiFetch<ApiPosSale[]>('/pos/sales'));
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'Tickets POS indisponibles.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadSales();
  }, []);

  const viewSale = async (id: string) => {
    setMessage(null);
    try {
      setSelectedSale(await apiFetch<ApiPosSale>(`/pos/sales/${id}`));
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'Ticket introuvable.');
    }
  };

  const printTicket = (sale: ApiPosSale) => {
    setPrintSale(sale);
    window.setTimeout(() => window.print(), 50);
  };

  return (
    <>
      <div className="print:hidden">
        <PosShell>
          <PosPageHeader title="Commandes / Tickets">
            <button
              type="button"
              onClick={() => void loadSales()}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-surface px-4 text-sm font-semibold text-on-surface"
            >
              <Icon name="refresh" className="text-[20px]" />
              Actualiser
            </button>
          </PosPageHeader>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
            {message && <div className="mb-4 rounded-lg border border-error-container bg-error-container p-3 text-sm text-on-error-container">{message}</div>}

            <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
              <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                <div className="border-b border-outline-variant px-4 py-3">
                  <h2 className="font-display text-headline-md text-primary">Tickets récents</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[880px] text-left text-sm">
                    <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary">
                      <tr>
                        <th className="p-4">Ticket</th>
                        <th className="p-4">Date</th>
                        <th className="p-4">Employé</th>
                        <th className="p-4">Caisse</th>
                        <th className="p-4">Paiement</th>
                        <th className="p-4 text-right">Total</th>
                        <th className="p-4">Statut</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {isLoading ? (
                        <tr><td className="p-6 text-on-surface-variant" colSpan={8}>Chargement des tickets...</td></tr>
                      ) : sales.length ? (
                        sales.map((sale) => (
                          <tr key={sale.id} className="border-t border-outline-variant align-top">
                            <td className="p-4 font-semibold text-on-surface">{sale.receiptNumber}</td>
                            <td className="p-4 text-on-surface-variant">{new Date(sale.createdAt).toLocaleString('fr-FR')}</td>
                            <td className="p-4">{employeeName(sale)}</td>
                            <td className="p-4">{sale.register?.code ?? 'CAISSE-01'}</td>
                            <td className="p-4">{paymentLabel(sale.paymentMethod)}</td>
                            <td className="p-4 text-right font-semibold">{formatPrice(sale.total)}</td>
                            <td className="p-4">
                              <span className="rounded-full bg-primary-container/25 px-3 py-1 text-xs font-semibold text-primary">{statusLabel(sale.status)}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => void viewSale(sale.id)} className="rounded-lg border border-outline-variant px-3 py-2 font-semibold text-on-surface">Voir</button>
                                <button type="button" onClick={() => printTicket(sale)} className="rounded-lg border border-outline-variant px-3 py-2 font-semibold text-on-surface">Imprimer ticket</button>
                                <Link to={`/pos/invoices?saleId=${sale.id}`} className="rounded-lg bg-primary px-3 py-2 font-semibold text-on-primary">Créer facture</Link>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td className="p-6 text-on-surface-variant" colSpan={8}>Aucun ticket POS pour le moment.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <aside className="h-fit rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                <h2 className="font-display text-headline-md text-primary">Détail ticket</h2>
                {selectedSale ? (
                  <div className="mt-4 space-y-4">
                    <div className="rounded-lg bg-surface-container-low p-3 text-sm">
                      <p className="font-semibold">{selectedSale.receiptNumber}</p>
                      <p className="text-on-surface-variant">{new Date(selectedSale.createdAt).toLocaleString('fr-FR')}</p>
                      <p className="text-on-surface-variant">{employeeName(selectedSale)} - {selectedSale.register?.code ?? 'CAISSE-01'}</p>
                    </div>
                    <div className="space-y-2">
                      {selectedSale.items.map((item) => (
                        <div key={item.id} className="flex justify-between gap-3 border-b border-outline-variant pb-2 text-sm">
                          <span>{item.quantity} x {item.productName}</span>
                          <span className="font-semibold">{formatPrice(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-lg font-bold text-primary">
                      <span>Total</span>
                      <span>{formatPrice(selectedSale.total)}</span>
                    </div>
                    <button type="button" onClick={() => printTicket(selectedSale)} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-on-primary">
                      <Icon name="print" className="text-[20px]" />
                      Imprimer ticket
                    </button>
                  </div>
                ) : (
                  <p className="mt-4 rounded-lg border border-dashed border-outline-variant p-5 text-sm text-on-surface-variant">Sélectionnez un ticket pour voir ses lignes.</p>
                )}
              </aside>
            </div>
          </div>
        </PosShell>
      </div>
      <PrintableTicket sale={printSale} />
    </>
  );
}
