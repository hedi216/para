import { useEffect, useState } from 'react';
import { BackOfficeShell } from '../components/BackOfficeShell';
import { ApiError, apiFetch } from '../lib/api';
import { formatPrice } from '../lib/currency';
import type { ApiOrder } from '../types/api';

const statuses = ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'OUT_FOR_DELIVERY', 'COMPLETED', 'CANCELLED'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const load = () => apiFetch<ApiOrder[]>('/admin/orders').then(setOrders).catch((error: Error) => setMessage(error.message));
  useEffect(() => { void load(); }, []);
  const changeStatus = async (order: ApiOrder, status: string) => { try { await apiFetch(`/admin/orders/${order.id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }); await load(); } catch (error) { setMessage(error instanceof ApiError ? error.message : 'Mise à jour impossible.'); } };
  return <BackOfficeShell title="Commandes"><p className="mb-5 text-on-surface-variant">Les commandes web confirmées diminuent immédiatement le stock partagé.</p>{message && <p className="mb-5 border border-error-container bg-error-container p-3 text-sm text-on-error-container">{message}</p>}<div className="overflow-x-auto border border-outline-variant bg-surface"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary"><tr><th className="p-4">Commande</th><th className="p-4">Client</th><th className="p-4">Paiement</th><th className="p-4">Total</th><th className="p-4">Statut</th><th className="p-4">Date</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-t border-outline-variant"><td className="p-4 font-semibold">{order.orderNumber}<p className="mt-1 text-xs font-normal text-on-surface-variant">{order.items.length} article(s)</p></td><td className="p-4">{order.recipientName}</td><td className="p-4 text-on-surface-variant">{order.paymentMethod}</td><td className="p-4 text-primary">{formatPrice(order.total)}</td><td className="p-4"><select aria-label={`Statut ${order.orderNumber}`} value={order.status} onChange={(event) => changeStatus(order, event.target.value)} className="border border-outline-variant bg-surface px-2 py-2 text-xs font-semibold text-primary">{statuses.map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td className="p-4 text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString('fr-TN')}</td></tr>)}</tbody></table></div></BackOfficeShell>;
}
