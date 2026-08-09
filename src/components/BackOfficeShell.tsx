import type { ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import logo from '../assets/logoLolla.jpg';
import { useAuth } from '../contexts/auth-context';
import { Icon } from './Icon';

const adminLinks = [
  { to: '/admin', label: 'Vue d’ensemble', icon: 'space_dashboard', end: true },
  { to: '/admin/produits', label: 'Produits', icon: 'inventory_2' },
  { to: '/admin/stock', label: 'Stock', icon: 'warehouse' },
  { to: '/admin/commandes', label: 'Commandes', icon: 'receipt_long' },
  { to: '/admin/clients', label: 'Clients', icon: 'group' },
];

export function BackOfficeShell({ title, children }: { title: string; children: ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const isPos = location.pathname.startsWith('/pos');

  return (
    <div className="min-h-screen bg-surface-container-low text-on-surface">
      <header className="border-b border-outline-variant bg-surface">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link to="/" className="flex items-center gap-3 text-primary"><img src={logo} alt="LOLA" className="h-10 w-10 rounded-full object-cover" /><span className="font-display text-[28px]">LOLA</span><span className="hidden border-l border-outline-variant pl-3 text-label-sm font-bold uppercase tracking-widest text-secondary sm:inline">{isPos ? 'Caisse' : 'Administration'}</span></Link>
          <div className="flex items-center gap-3"><span className="hidden text-sm text-on-surface-variant sm:inline">{user?.firstName} {user?.lastName}</span><Link title="Voir le site" to="/" className="flex h-9 w-9 items-center justify-center text-primary hover:bg-secondary-container"><Icon name="open_in_new" className="text-[19px]" /></Link><button title="Se déconnecter" onClick={logout} className="flex h-9 w-9 items-center justify-center text-primary hover:bg-secondary-container"><Icon name="logout" className="text-[19px]" /></button></div>
        </div>
      </header>
      <div className="mx-auto grid max-w-[1500px] lg:grid-cols-[230px_1fr]">
        <aside className="border-b border-outline-variant bg-surface lg:min-h-[calc(100vh-65px)] lg:border-b-0 lg:border-r">
          <nav className="flex gap-1 overflow-x-auto p-3 lg:flex-col lg:p-5">
            {adminLinks.map((link) => <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm font-semibold transition ${isActive && !isPos ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-secondary-container hover:text-primary'}`}><Icon name={link.icon} className="text-[19px]" />{link.label}</NavLink>)}
            <NavLink to="/pos" className={({ isActive }) => `flex shrink-0 items-center gap-3 px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-secondary-container hover:text-primary'}`}><Icon name="point_of_sale" className="text-[19px]" />Caisse POS</NavLink>
          </nav>
        </aside>
        <main className="min-w-0 p-4 md:p-8"><div className="mb-7 flex items-end justify-between"><div><p className="text-label-sm font-bold uppercase tracking-widest text-secondary">LOLA Parapharmacie</p><h1 className="mt-1 font-display text-headline-lg text-primary">{title}</h1></div></div>{children}</main>
      </div>
    </div>
  );
}
