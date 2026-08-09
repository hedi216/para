import { FormEvent, useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { PosPageHeader } from '../components/pos/PosPageHeader';
import { PosShell } from '../components/pos/PosShell';
import { ApiError, apiFetch } from '../lib/api';
import type { ApiPosCustomer } from '../types/api';

type CustomerForm = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  defaultAddress: string;
  city: string;
  birthDate: string;
  marketingEmailConsent: boolean;
  marketingSmsConsent: boolean;
  notes: string;
};

const emptyCustomerForm: CustomerForm = {
  firstName: '',
  lastName: '',
  phone: '',
  email: '',
  defaultAddress: '',
  city: '',
  birthDate: '',
  marketingEmailConsent: false,
  marketingSmsConsent: false,
  notes: '',
};

function fullName(customer: ApiPosCustomer) {
  return `${customer.firstName} ${customer.lastName}`.trim();
}

function sourceLabel(source: ApiPosCustomer['source']) {
  return source === 'POS_CREATED' ? 'Comptoir' : 'En ligne';
}

function consentLabel(value: boolean) {
  return value ? 'Oui' : 'Non';
}

export default function PosCustomersPage() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<ApiPosCustomer[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CustomerForm>(emptyCustomerForm);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

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

  const updateForm = <K extends keyof CustomerForm>(field: K, value: CustomerForm[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const createCustomer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isCreating) return;
    setIsCreating(true);
    setMessage(null);

    try {
      const customer = await apiFetch<ApiPosCustomer>('/pos/customers', {
        method: 'POST',
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          ...(form.email.trim() ? { email: form.email.trim() } : {}),
          ...(form.defaultAddress.trim() ? { defaultAddress: form.defaultAddress.trim() } : {}),
          ...(form.city.trim() ? { city: form.city.trim() } : {}),
          ...(form.birthDate ? { birthDate: form.birthDate } : {}),
          marketingEmailConsent: form.marketingEmailConsent,
          marketingSmsConsent: form.marketingSmsConsent,
          ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
        }),
      });
      setForm(emptyCustomerForm);
      setShowForm(false);
      setSearch(customer.phone ?? customer.email ?? customer.firstName);
      setMessage({ type: 'success', text: `${fullName(customer)} a été ajouté comme client comptoir.` });
      await loadCustomers(customer.phone ?? customer.email ?? customer.firstName);
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof ApiError ? error.message : 'Création client impossible.' });
    } finally {
      setIsCreating(false);
    }
  };

  const selectCustomer = (customer: ApiPosCustomer) => {
    setMessage({ type: 'info', text: `${fullName(customer)} est prêt pour une future association au ticket. L'association client au ticket sera connectée à l'étape fidélité.` });
  };

  return (
    <PosShell>
      <PosPageHeader title="Recherche client">
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <form onSubmit={submit} className="relative min-w-0 sm:w-[360px]">
            <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[22px] text-outline" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nom, téléphone, email..."
              className="min-h-10 w-full rounded-lg border border-outline-variant bg-surface pl-10 pr-3 text-sm outline-none focus:border-primary"
            />
          </form>
          <button
            type="button"
            onClick={() => setShowForm((value) => !value)}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-on-primary"
          >
            <Icon name="person_add" className="text-[20px]" />
            Nouveau client
          </button>
        </div>
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

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
            <div className="border-b border-outline-variant px-4 py-3">
              <h2 className="font-display text-headline-md text-primary">Clients LOLA</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary">
                  <tr>
                    <th className="p-4">Client</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Téléphone</th>
                    <th className="p-4">Email</th>
                    <th className="p-4 text-right">Fidélité</th>
                    <th className="p-4 text-center">Email marketing</th>
                    <th className="p-4 text-center">SMS marketing</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td className="p-6 text-on-surface-variant" colSpan={8}>Chargement des clients...</td></tr>
                  ) : customers.length ? (
                    customers.map((customer) => (
                      <tr key={customer.id} className="border-t border-outline-variant">
                        <td className="p-4 font-semibold text-on-surface">
                          {fullName(customer)}
                          {customer.defaultAddress && <p className="mt-1 text-xs font-normal text-on-surface-variant">{customer.defaultAddress}</p>}
                          {customer.notes && <p className="mt-1 text-xs font-normal text-on-surface-variant">Note : {customer.notes}</p>}
                        </td>
                        <td className="p-4">
                          <span className="rounded-full bg-primary-container/25 px-3 py-1 text-xs font-semibold text-primary">{sourceLabel(customer.source)}</span>
                        </td>
                        <td className="p-4 text-on-surface-variant">{customer.phone ?? '-'}</td>
                        <td className="p-4 text-on-surface-variant">{customer.email ?? '-'}</td>
                        <td className="p-4 text-right font-semibold text-primary">{customer.loyaltyPoints} pts</td>
                        <td className="p-4 text-center">{consentLabel(customer.marketingEmailConsent)}</td>
                        <td className="p-4 text-center">{consentLabel(customer.marketingSmsConsent)}</td>
                        <td className="p-4 text-right">
                          <button type="button" onClick={() => selectCustomer(customer)} className="rounded-lg bg-primary px-4 py-2 font-semibold text-on-primary">
                            Sélectionner
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td className="p-6 text-on-surface-variant" colSpan={8}>Aucun client trouvé.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="space-y-5">
            {showForm && (
              <form onSubmit={createCustomer} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
                <h2 className="font-display text-headline-md text-primary">Nouveau client</h2>
                <p className="mt-2 text-sm text-on-surface-variant">Le marketing email/SMS est préparé, sans campagne automatique en v1.</p>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">
                    Prénom
                    <input required value={form.firstName} onChange={(event) => updateForm('firstName', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                  </label>
                  <label className="block text-sm font-semibold">
                    Nom
                    <input required value={form.lastName} onChange={(event) => updateForm('lastName', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                  </label>
                </div>

                <label className="mt-4 block text-sm font-semibold">
                  Téléphone
                  <input required value={form.phone} onChange={(event) => updateForm('phone', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                </label>

                <label className="mt-4 block text-sm font-semibold">
                  E-mail optionnel
                  <input type="email" value={form.email} onChange={(event) => updateForm('email', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                </label>

                <label className="mt-4 block text-sm font-semibold">
                  Adresse
                  <input value={form.defaultAddress} onChange={(event) => updateForm('defaultAddress', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                </label>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-semibold">
                    Ville
                    <input value={form.city} onChange={(event) => updateForm('city', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                  </label>
                  <label className="block text-sm font-semibold">
                    Date anniversaire
                    <input type="date" value={form.birthDate} onChange={(event) => updateForm('birthDate', event.target.value)} className="mt-2 min-h-11 w-full rounded-lg border border-outline-variant bg-surface px-3 font-normal outline-none focus:border-primary" />
                  </label>
                </div>

                <div className="mt-4 space-y-3 rounded-lg border border-outline-variant bg-surface p-3">
                  <label className="flex items-start gap-3 text-sm font-semibold">
                    <input type="checkbox" checked={form.marketingEmailConsent} onChange={(event) => updateForm('marketingEmailConsent', event.target.checked)} className="mt-1" />
                    Consentement marketing email
                  </label>
                  <label className="flex items-start gap-3 text-sm font-semibold">
                    <input type="checkbox" checked={form.marketingSmsConsent} onChange={(event) => updateForm('marketingSmsConsent', event.target.checked)} className="mt-1" />
                    Consentement marketing SMS
                  </label>
                </div>

                <label className="mt-4 block text-sm font-semibold">
                  Notes
                  <textarea value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} className="mt-2 min-h-24 w-full rounded-lg border border-outline-variant bg-surface px-3 py-3 font-normal outline-none focus:border-primary" />
                </label>

                <button type="submit" disabled={isCreating} className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-on-primary disabled:opacity-50">
                  <Icon name="save" className="text-[20px]" />
                  {isCreating ? 'Création...' : 'Créer client comptoir'}
                </button>
              </form>
            )}

            <section className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <h2 className="font-display text-headline-md text-primary">Association ticket</h2>
              <p className="mt-2 text-sm text-on-surface-variant">L'association client au ticket sera connectée à l'étape fidélité. La sélection actuelle prépare ce futur lien sans appliquer de remise.</p>
            </section>
          </aside>
        </div>
      </div>
    </PosShell>
  );
}
