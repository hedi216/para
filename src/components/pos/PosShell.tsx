import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logoLolla from '../../assets/logoLolla.jpg';
import { useAuth } from '../../contexts/auth-context';
import { Icon } from '../Icon';

const posNavItems = [
  { to: '/pos', label: 'Point de vente', icon: 'point_of_sale', end: true },
  { to: '/pos/orders', label: 'Commandes', icon: 'receipt_long' },
  { to: '/pos/stock', label: 'Gestion stock', icon: 'inventory_2' },
  { to: '/pos/customers', label: 'Recherche client', icon: 'person_search' },
  { to: '/pos/invoices', label: 'Factures', icon: 'contract' },
];

type PosShellProps = {
  children: ReactNode;
  onNewTransaction?: () => void;
};

export function PosShell({ children, onNewTransaction }: PosShellProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const employeeName = user ? `${user.firstName} ${user.lastName}`.trim() : 'Employé LOLA';

  const startNewTransaction = () => {
    if (onNewTransaction) {
      onNewTransaction();
      return;
    }
    navigate('/pos');
  };

  return (
    <div className="min-h-screen bg-background text-on-background lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen flex-col lg:h-screen lg:flex-row lg:overflow-hidden">
        <aside className="flex shrink-0 flex-col bg-inverse-surface px-4 py-5 text-inverse-on-surface lg:h-screen lg:w-64 lg:px-6 lg:py-7">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-lg border border-primary-fixed/25 bg-surface-container-lowest">
              <img src={logoLolla} alt="LOLA Parapharmacie" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="font-display text-[28px] font-bold leading-tight text-primary-fixed">LOLA POS</h1>
              <p className="mt-0.5 text-sm text-inverse-on-surface/65">Branche Sousse</p>
            </div>
          </div>

          <nav className="mt-6 flex gap-2 overflow-x-auto pb-1 lg:mt-10 lg:flex-col lg:gap-4 lg:overflow-visible lg:pb-0">
            {posNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-semibold tracking-[0.05em] transition ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container'
                      : 'text-inverse-on-surface/80 hover:bg-inverse-on-surface/10 hover:text-inverse-on-surface'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon name={item.icon} filled={isActive} className="text-[23px]" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <button
            type="button"
            onClick={startNewTransaction}
            className="mt-5 min-h-12 rounded-lg bg-primary px-4 text-sm font-bold tracking-[0.04em] text-on-primary shadow-sm transition hover:opacity-95 lg:mt-auto"
          >
            Nouvelle transaction
          </button>

          <div className="mt-5 hidden rounded-lg border border-inverse-on-surface/10 bg-inverse-on-surface/5 p-3 lg:block">
            <p className="text-[11px] uppercase tracking-[0.08em] text-inverse-on-surface/55">Employé connecté</p>
            <p className="mt-1 text-sm font-semibold text-inverse-on-surface">{employeeName}</p>
            <p className="text-xs text-primary-fixed">Caisse 01</p>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col bg-surface lg:h-screen lg:overflow-hidden">{children}</main>
      </div>
    </div>
  );
}
