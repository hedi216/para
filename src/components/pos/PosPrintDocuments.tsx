import { formatPrice } from '../../lib/currency';
import type { ApiPosInvoice, ApiPosSale } from '../../types/api';

const companyName = 'LOLA Parapharmacie';
const companyAddress = 'Sousse, Tunisie';

function employeeName(sale: ApiPosSale | ApiPosInvoice['posSale']) {
  return `${sale.employee.firstName} ${sale.employee.lastName}`.trim();
}

function paymentLabel(method: string) {
  if (method === 'CASH') return 'Espèces';
  if (method === 'CARD') return 'Carte';
  if (method === 'CASH_ON_DELIVERY') return 'Paiement à la livraison';
  if (method === 'IN_STORE') return 'Paiement en magasin';
  return method;
}

export function PrintableTicket({ sale }: { sale: ApiPosSale | null }) {
  if (!sale) return null;

  return (
    <div className="hidden print:block">
      <div className="mx-auto max-w-[360px] bg-white p-4 font-mono text-[12px] leading-relaxed text-black">
        <div className="text-center">
          <h1 className="text-base font-bold">{companyName}</h1>
          <p>{companyAddress}</p>
          <p>Ticket client POS</p>
          <p className="mt-2 text-[10px]">Non fiscal - facture officielle à valider ultérieurement</p>
        </div>

        <div className="my-4 border-y border-black py-2">
          <p>Ticket: {sale.receiptNumber}</p>
          <p>Date: {new Date(sale.createdAt).toLocaleString('fr-FR')}</p>
          <p>Caisse: {sale.register?.code ?? 'CAISSE-01'}</p>
          <p>Employé: {employeeName(sale)}</p>
        </div>

        <div className="space-y-2">
          {sale.items.map((item) => (
            <div key={item.id}>
              <p className="font-bold">{item.productName}</p>
              <div className="flex justify-between gap-3">
                <span>
                  {item.quantity} x {formatPrice(item.unitPrice)}
                </span>
                <span>{formatPrice(item.lineTotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 border-t border-black pt-2">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{formatPrice(sale.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Remise fidélité</span>
            <span>{formatPrice(0)}</span>
          </div>
          <div className="flex justify-between">
            <span>TVA 19%</span>
            <span>Incluse</span>
          </div>
          <div className="mt-2 flex justify-between text-base font-bold">
            <span>Total</span>
            <span>{formatPrice(sale.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paiement</span>
            <span>{paymentLabel(sale.paymentMethod)}</span>
          </div>
        </div>

        <p className="mt-5 text-center">Merci pour votre visite.</p>
      </div>
    </div>
  );
}

export function PrintableInvoice({ invoice }: { invoice: ApiPosInvoice | null }) {
  if (!invoice) return null;

  return (
    <div className="hidden print:block">
      <div className="mx-auto max-w-[720px] bg-white p-8 text-sm leading-relaxed text-black">
        <div className="flex items-start justify-between gap-8 border-b border-black pb-5">
          <div>
            <h1 className="font-display text-2xl font-bold">{companyName}</h1>
            <p>{companyAddress}</p>
            <p className="mt-2 text-xs">Document interne / proforma v1 - non fiscal officiel</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-widest">Facture interne</p>
            <p className="text-xl font-bold">{invoice.invoiceNumber}</p>
            <p>{new Date(invoice.createdAt).toLocaleDateString('fr-FR')}</p>
          </div>
        </div>

        <div className="my-6 grid grid-cols-2 gap-8">
          <div>
            <h2 className="font-bold">Client</h2>
            <p>{invoice.customerName}</p>
            <p>{invoice.customerPhone}</p>
            <p>{invoice.customerAddress}</p>
            {invoice.taxIdentifier && <p>Matricule fiscal: {invoice.taxIdentifier}</p>}
          </div>
          <div>
            <h2 className="font-bold">Ticket source</h2>
            <p>{invoice.posSale.receiptNumber}</p>
            <p>{new Date(invoice.posSale.createdAt).toLocaleString('fr-FR')}</p>
            <p>Caisse: {invoice.posSale.register?.code ?? 'CAISSE-01'}</p>
            <p>Employé: {employeeName(invoice.posSale)}</p>
          </div>
        </div>

        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-black">
              <th className="py-2">Produit</th>
              <th className="py-2 text-right">Qté</th>
              <th className="py-2 text-right">Prix</th>
              <th className="py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className="border-b border-black/20">
                <td className="py-2">
                  <span className="font-semibold">{item.productName}</span>
                  <br />
                  <span>{item.brandName}</span>
                </td>
                <td className="py-2 text-right">{item.quantity}</td>
                <td className="py-2 text-right">{formatPrice(item.unitPrice)}</td>
                <td className="py-2 text-right">{formatPrice(item.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ml-auto mt-6 w-full max-w-[300px] space-y-2">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{formatPrice(invoice.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>TVA incluse indicative</span>
            <span>{invoice.taxTotal ? formatPrice(invoice.taxTotal) : 'Incluse'}</span>
          </div>
          <div className="flex justify-between border-t border-black pt-2 text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(invoice.total)}</span>
          </div>
          <div className="flex justify-between">
            <span>Paiement</span>
            <span>{paymentLabel(invoice.posSale.paymentMethod)}</span>
          </div>
        </div>

        {invoice.notes && <p className="mt-8 border-t border-black/30 pt-4">Notes: {invoice.notes}</p>}
      </div>
    </div>
  );
}
