import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BackOfficeShell } from '../components/BackOfficeShell';
import { apiFetch } from '../lib/api';
import { formatPrice } from '../lib/currency';
import type { ApiAdminDashboard } from '../types/api';

export default function AdminDashboardPage() {
  const [dashboard, setDashboard] = useState<ApiAdminDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<ApiAdminDashboard>('/admin/dashboard')
      .then(setDashboard)
      .catch((reason: Error) => setError(reason.message));
  }, []);

  const webChannel = dashboard?.channels.find((channel) => channel.channel === 'WEB');
  const storeChannel = dashboard?.channels.find((channel) => channel.channel === 'STORE');
  const stockToWatch = (dashboard?.stockAlerts.outOfStock ?? 0) + (dashboard?.stockAlerts.lowStock ?? 0);

  return (
    <BackOfficeShell title="Vue d'ensemble">
      {error ? (
        <p className="border border-error-container bg-error-container p-4 text-on-error-container">{error}</p>
      ) : !dashboard ? (
        <p className="py-12 text-on-surface-variant">Chargement des indicateurs...</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Metric label="Revenus total" value={formatPrice(dashboard.revenue.total)} link="/admin/commandes" />
            <Metric label="Canal web" value={`${webChannel?.percent ?? 0}%`} detail={formatPrice(dashboard.revenue.web)} link="/admin/commandes" />
            <Metric label="Canal magasin" value={`${storeChannel?.percent ?? 0}%`} detail={formatPrice(dashboard.revenue.store)} link="/pos" />
            <Metric label="Panier moyen" value={formatPrice(dashboard.averageBasket)} link="/admin/commandes" />
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
            <section className="border border-outline-variant bg-surface">
              <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
                <h2 className="font-display text-headline-md text-primary">Commandes et ventes recentes</h2>
                <Link className="text-label-sm font-bold uppercase tracking-widest text-primary" to="/admin/commandes">
                  Tout voir
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[640px] text-left text-sm">
                  <thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary">
                    <tr>
                      <th className="p-4">Reference</th>
                      <th className="p-4">Canal</th>
                      <th className="p-4">Contact</th>
                      <th className="p-4">Statut</th>
                      <th className="p-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboard.recentActivity.map((activity) => (
                      <tr key={`${activity.type}-${activity.id}`} className="border-t border-outline-variant">
                        <td className="p-4 font-semibold">{activity.reference}</td>
                        <td className="p-4">{activity.channel === 'WEB' ? 'Web' : activity.registerCode ?? 'Magasin'}</td>
                        <td className="p-4">{activity.customerName ?? activity.employeeName ?? '-'}</td>
                        <td className="p-4">{activity.status}</td>
                        <td className="p-4 text-right text-primary">{formatPrice(activity.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="border border-outline-variant bg-surface">
              <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
                <h2 className="font-display text-headline-md text-primary">Stock a surveiller</h2>
                <Link className="text-label-sm font-bold uppercase tracking-widest text-primary" to="/admin/stock">
                  Ajuster
                </Link>
              </div>
              <div className="border-b border-outline-variant px-5 py-4">
                <p className="text-label-sm font-bold uppercase tracking-widest text-secondary">Alertes</p>
                <p className={`mt-2 font-display text-headline-lg ${stockToWatch ? 'text-error' : 'text-primary'}`}>{stockToWatch}</p>
              </div>
              <div className="divide-y divide-outline-variant">
                {dashboard.stockAlerts.items.length ? (
                  dashboard.stockAlerts.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between gap-4 px-5 py-4">
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-sm text-on-surface-variant">{item.brandName}</p>
                      </div>
                      <span className="border border-error-container bg-error-container px-2 py-1 text-sm font-semibold text-on-error-container">{item.available}</span>
                    </div>
                  ))
                ) : (
                  <p className="p-5 text-on-surface-variant">Aucun seuil atteint.</p>
                )}
              </div>
            </section>
          </div>
        </>
      )}
    </BackOfficeShell>
  );
}

function Metric({ label, value, detail, link }: { label: string; value: string; detail?: string; link: string }) {
  return (
    <Link to={link} className="border border-outline-variant bg-surface p-5 transition hover:border-primary-container">
      <p className="text-label-sm font-bold uppercase tracking-widest text-secondary">{label}</p>
      <p className="mt-3 font-display text-headline-lg text-primary">{value}</p>
      {detail && <p className="mt-1 text-sm text-on-surface-variant">{detail}</p>}
    </Link>
  );
}
