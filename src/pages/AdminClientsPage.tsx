import { useEffect, useState } from 'react';
import { BackOfficeShell } from '../components/BackOfficeShell';
import { apiFetch } from '../lib/api';

type Client = { id: string; loyaltyPoints: number; city?: string | null; user: { id: string; email: string; firstName: string; lastName: string; phone?: string | null; createdAt: string; _count: { customerOrders: number } } };

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { apiFetch<Client[]>('/admin/clients').then(setClients).catch((error: Error) => setMessage(error.message)); }, []);
  return <BackOfficeShell title="Clients"><p className="mb-5 text-on-surface-variant">Comptes clients et historique de commandes web.</p>{message && <p className="mb-5 border border-error-container bg-error-container p-3 text-sm text-on-error-container">{message}</p>}<div className="overflow-x-auto border border-outline-variant bg-surface"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary"><tr><th className="p-4">Client</th><th className="p-4">Contact</th><th className="p-4">Ville</th><th className="p-4 text-right">Commandes</th><th className="p-4 text-right">Points</th></tr></thead><tbody>{clients.map((client) => <tr key={client.id} className="border-t border-outline-variant"><td className="p-4 font-semibold">{client.user.firstName} {client.user.lastName}</td><td className="p-4"><p>{client.user.email}</p><p className="mt-1 text-on-surface-variant">{client.user.phone || '—'}</p></td><td className="p-4">{client.city || '—'}</td><td className="p-4 text-right">{client.user._count.customerOrders}</td><td className="p-4 text-right text-primary">{client.loyaltyPoints}</td></tr>)}</tbody></table></div></BackOfficeShell>;
}
