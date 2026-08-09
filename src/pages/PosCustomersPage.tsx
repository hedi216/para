import { FormEvent, useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { PosPageHeader } from '../components/pos/PosPageHeader';
import { PosShell } from '../components/pos/PosShell';
import { ApiError, apiFetch } from '../lib/api';
import type { ApiPosCustomer } from '../types/api';

function fullName(customer: ApiPosCustomer) {
  return `${customer.firstName} ${customer.lastName}`.trim();
}

export default function PosCustomersPage() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<ApiPosCustomer[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = async (value = search) => {
    setIsLoading(true);
    try {
      setCustomers(await apiFetch<ApiPosCustomer[]>(`/pos/customers${value.trim() ? `?search=${encodeURIComponent(value.trim())}` : ''}`));
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Clients indisponibles.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers('');
  }, []);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void loadCustomers(search);
  };

  const selectCustomer = (customer: ApiPosCustomer) => {
    setMessage({ type: 'info', text: `${fullName(customer)} est prêt pour une future association au ticket.` });
  };

  return (
    <PosShell>
      <PosPageHeader title="Recherche client">
        <form onSubmit={submit} className="relative w-full sm:w-[360px]">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[22px] text-outline" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Nom, téléphone, email..."
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

        <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="border-b border-outline-variant px-4 py-3">
            <h2 className="font-display text-headline-md text-primary">Clients LOLA</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary">
                <tr>
                  <th className="p-4">Client</th>
                  <th className="p-4">Téléphone</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-right">Fidélité</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td className="p-6 text-on-surface-variant" colSpan={5}>Chargement des clients...</td></tr>
                ) : customers.length ? (
                  customers.map((customer) => (
                    <tr key={customer.id} className="border-t border-outline-variant">
                      <td className="p-4 font-semibold text-on-surface">
                        {fullName(customer)}
                        {customer.defaultAddress && <p className="mt-1 text-xs font-normal text-on-surface-variant">{customer.defaultAddress}</p>}
                      </td>
                      <td className="p-4 text-on-surface-variant">{customer.phone ?? '-'}</td>
                      <td className="p-4 text-on-surface-variant">{customer.email}</td>
                      <td className="p-4 text-right font-semibold text-primary">{customer.loyaltyPoints} pts</td>
                      <td className="p-4 text-right">
                        <button type="button" onClick={() => selectCustomer(customer)} className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary">
                          Sélectionner
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td className="p-6 text-on-surface-variant" colSpan={5}>Aucun client trouvé.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PosShell>
  );
}
