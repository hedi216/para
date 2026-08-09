import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { ApiError, apiFetch } from '../lib/api';
import { formatPrice } from '../lib/currency';
import type { ApiOrder } from '../types/api';

type Mode = 'login' | 'register';

export default function AccountPage() {
  const { user, login, register, logout } = useAuth();
  const [mode, setMode] = useState<Mode>('login');
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '' });

  useEffect(() => {
    if (user?.role !== 'CUSTOMER') return;
    apiFetch<ApiOrder[]>('/orders/my-orders').then(setOrders).catch(() => setOrders([]));
  }, [user]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    setIsSubmitting(true);
    try {
      const sessionUser = mode === 'login'
        ? await login({ email: form.email, password: form.password })
        : await register(form);
      const next = searchParams.get('next');
      const destination = next || (sessionUser.role === 'ADMIN' ? '/admin' : sessionUser.role === 'EMPLOYEE' ? '/pos' : '/compte');
      navigate(destination);
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : 'Impossible de se connecter au service LOLA.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user) {
    return (
      <section className="bg-surface-container-low py-12 md:py-20">
        <div className="section-shell grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit bg-primary p-6 text-on-primary">
            <p className="text-label-sm font-bold uppercase tracking-widest text-primary-fixed">Mon compte</p>
            <h1 className="mt-3 font-display text-headline-lg">Bonjour {user.firstName}</h1>
            <p className="mt-2 text-sm text-primary-fixed">{user.email}</p>
            {user.role === 'ADMIN' && <Link to="/admin" className="mt-7 block border border-primary-fixed px-4 py-3 text-center text-label-sm uppercase tracking-widest hover:bg-primary-fixed hover:text-primary">Administration</Link>}
            {user.role !== 'CUSTOMER' && <Link to="/pos" className="mt-3 block border border-primary-fixed px-4 py-3 text-center text-label-sm uppercase tracking-widest hover:bg-primary-fixed hover:text-primary">Ouvrir la caisse</Link>}
            <button onClick={logout} className="mt-7 text-label-sm font-bold uppercase tracking-widest text-primary-fixed hover:text-on-primary">Se déconnecter</button>
          </aside>
          <div className="bg-surface p-6 md:p-8">
            <p className="text-label-sm font-bold uppercase tracking-widest text-secondary">Vos informations</p>
            <h2 className="mt-2 font-display text-headline-lg text-primary">Mes commandes</h2>
            {user.role !== 'CUSTOMER' ? (
              <p className="mt-6 text-on-surface-variant">Ce compte est réservé à l’espace équipe LOLA.</p>
            ) : orders.length > 0 ? (
              <div className="mt-7 overflow-x-auto border border-outline-variant"><table className="w-full min-w-[570px] text-left text-sm"><thead className="bg-surface-container-low text-label-sm uppercase tracking-wider text-secondary"><tr><th className="p-4">Commande</th><th className="p-4">Date</th><th className="p-4">Statut</th><th className="p-4 text-right">Total</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id} className="border-t border-outline-variant"><td className="p-4 font-semibold">{order.orderNumber}</td><td className="p-4">{new Date(order.createdAt).toLocaleDateString('fr-TN')}</td><td className="p-4"><span className="border border-primary-container px-2 py-1 text-xs text-primary">{order.status}</span></td><td className="p-4 text-right text-primary">{formatPrice(order.total)}</td></tr>)}</tbody></table></div>
            ) : <p className="mt-6 text-on-surface-variant">Vous n’avez pas encore passé de commande. <Link to="/catalogue" className="text-primary underline">Explorer le catalogue</Link></p>}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell grid min-h-[620px] items-center gap-12 py-12 md:grid-cols-[1fr_420px] md:py-20">
      <div className="hidden max-w-xl md:block"><p className="text-label-sm font-bold uppercase tracking-widest text-secondary">LOLA Parapharmacie</p><h1 className="mt-4 font-display text-display-lg text-primary">Votre routine, en toute simplicité.</h1><p className="mt-5 text-body-lg text-on-surface-variant">Retrouvez vos commandes, préparez votre panier et choisissez la livraison ou le retrait en magasin.</p></div>
      <form onSubmit={submit} className="border border-outline-variant bg-surface p-6 shadow-soft md:p-8">
        <div className="flex border-b border-outline-variant"><button type="button" onClick={() => setMode('login')} className={`flex-1 pb-3 text-label-md ${mode === 'login' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}>Connexion</button><button type="button" onClick={() => setMode('register')} className={`flex-1 pb-3 text-label-md ${mode === 'register' ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant'}`}>Créer un compte</button></div>
        <h2 className="mt-7 font-display text-headline-lg text-primary">{mode === 'login' ? 'Bienvenue' : 'Créer votre compte'}</h2>
        {message && <p className="mt-5 border border-error-container bg-error-container p-3 text-sm text-on-error-container">{message}</p>}
        <div className="mt-6 grid gap-4">{mode === 'register' && <><label className="text-sm font-semibold">Prénom<input required value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} className="mt-2 w-full border border-outline-variant px-3 py-3 font-normal outline-primary" /></label><label className="text-sm font-semibold">Nom<input required value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} className="mt-2 w-full border border-outline-variant px-3 py-3 font-normal outline-primary" /></label><label className="text-sm font-semibold">Téléphone<input value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} className="mt-2 w-full border border-outline-variant px-3 py-3 font-normal outline-primary" /></label></>}<label className="text-sm font-semibold">E-mail<input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="mt-2 w-full border border-outline-variant px-3 py-3 font-normal outline-primary" /></label><label className="text-sm font-semibold">Mot de passe<input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="mt-2 w-full border border-outline-variant px-3 py-3 font-normal outline-primary" /></label></div>
        <button disabled={isSubmitting} className="mt-7 min-h-12 w-full bg-primary px-4 text-label-md uppercase tracking-[0.05em] text-on-primary disabled:opacity-50">{isSubmitting ? 'Patientez...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}</button>
      </form>
    </section>
  );
}
