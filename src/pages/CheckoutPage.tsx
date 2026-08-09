import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useCart } from '../contexts/cart-context';
import { ApiError, apiFetch, createIdempotencyKey } from '../lib/api';
import { formatPrice } from '../lib/currency';
import type { ApiOrder } from '../types/api';

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'IN_STORE'>('CASH_ON_DELIVERY');
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ recipientName: '', recipientPhone: '', deliveryAddress: '', deliveryCity: 'Sousse', notes: '' });

  useEffect(() => {
    if (user) setForm((current) => ({ ...current, recipientName: `${user.firstName} ${user.lastName}`.trim(), recipientPhone: user.phone ?? '' }));
  }, [user]);

  if (items.length === 0) {
    return <div className="section-shell py-24 text-center"><h1 className="font-display text-headline-lg text-primary">Votre panier est vide</h1><Link to="/catalogue" className="mt-6 inline-flex bg-primary px-5 py-3 text-label-md text-on-primary">Voir le catalogue</Link></div>;
  }
  if (!user) {
    return <div className="section-shell py-24 text-center"><h1 className="font-display text-headline-lg text-primary">Connectez-vous pour commander</h1><p className="mt-3 text-on-surface-variant">Votre commande et son suivi seront disponibles dans votre compte.</p><Link to="/compte?next=%2Fcheckout" className="mt-6 inline-flex bg-primary px-5 py-3 text-label-md text-on-primary">Se connecter</Link></div>;
  }

  const deliveryFee = paymentMethod === 'CASH_ON_DELIVERY' ? 7 : 0;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus(null);
    setIsSubmitting(true);
    try {
      const order = await apiFetch<ApiOrder>('/orders', {
        method: 'POST',
        body: JSON.stringify({
          ...form,
          idempotencyKey: createIdempotencyKey('web-order'),
          paymentMethod,
          items: items.map((item) => ({ productId: item.id, quantity: item.quantity })),
        }),
      });
      clearCart();
      setStatus(`Commande ${order.orderNumber} confirmée.`);
      window.setTimeout(() => navigate('/compte'), 900);
    } catch (error) {
      setStatus(error instanceof ApiError ? error.message : 'Le service de commande est indisponible.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-surface-container-low py-12 md:py-20">
      <div className="section-shell grid gap-10 lg:grid-cols-[1fr_340px]">
        <form onSubmit={submit} className="bg-surface p-6 md:p-8">
          <p className="text-label-sm font-bold uppercase tracking-widest text-secondary">Finalisation</p>
          <h1 className="mt-2 font-display text-headline-lg text-primary">Livraison et paiement</h1>
          {status && <p className="mt-5 border border-primary-container bg-secondary-container/60 p-3 text-sm text-on-primary-container">{status}</p>}
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            <label className="text-sm font-semibold text-on-surface">Nom complet<input required value={form.recipientName} onChange={(event) => setForm({ ...form, recipientName: event.target.value })} className="mt-2 w-full border border-outline-variant bg-surface px-3 py-3 font-normal outline-primary" /></label>
            <label className="text-sm font-semibold text-on-surface">Téléphone<input required value={form.recipientPhone} onChange={(event) => setForm({ ...form, recipientPhone: event.target.value })} className="mt-2 w-full border border-outline-variant bg-surface px-3 py-3 font-normal outline-primary" /></label>
            <label className="text-sm font-semibold text-on-surface sm:col-span-2">Adresse de livraison<input required={paymentMethod === 'CASH_ON_DELIVERY'} value={form.deliveryAddress} onChange={(event) => setForm({ ...form, deliveryAddress: event.target.value })} className="mt-2 w-full border border-outline-variant bg-surface px-3 py-3 font-normal outline-primary" /></label>
            <label className="text-sm font-semibold text-on-surface">Ville<input value={form.deliveryCity} onChange={(event) => setForm({ ...form, deliveryCity: event.target.value })} className="mt-2 w-full border border-outline-variant bg-surface px-3 py-3 font-normal outline-primary" /></label>
            <label className="text-sm font-semibold text-on-surface sm:col-span-2">Note pour la commande<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-2 min-h-24 w-full border border-outline-variant bg-surface px-3 py-3 font-normal outline-primary" /></label>
          </div>
          <fieldset className="mt-8 border-t border-outline-variant pt-6"><legend className="text-label-md font-semibold text-on-surface">Mode de paiement</legend><div className="mt-4 grid gap-3">
            <label className="flex cursor-pointer items-center gap-3 border border-outline-variant p-4"><input checked={paymentMethod === 'CASH_ON_DELIVERY'} onChange={() => setPaymentMethod('CASH_ON_DELIVERY')} type="radio" name="payment" /><span><b>Paiement à la livraison</b><small className="mt-1 block text-on-surface-variant">Règlement à la réception de votre commande.</small></span></label>
            <label className="flex cursor-pointer items-center gap-3 border border-outline-variant p-4"><input checked={paymentMethod === 'IN_STORE'} onChange={() => setPaymentMethod('IN_STORE')} type="radio" name="payment" /><span><b>Paiement et retrait en magasin</b><small className="mt-1 block text-on-surface-variant">Votre commande vous attend à LOLA Sousse.</small></span></label>
            <div className="flex items-center gap-3 border border-outline-variant bg-surface-container-low p-4 text-on-surface-variant"><input disabled type="radio" name="payment" /><span><b>Paiement en ligne</b><small className="mt-1 block">Bientôt disponible.</small></span></div>
          </div></fieldset>
          <button disabled={isSubmitting} className="mt-8 min-h-12 w-full bg-primary px-5 text-label-md uppercase tracking-[0.05em] text-on-primary disabled:opacity-50">{isSubmitting ? 'Confirmation...' : 'Confirmer ma commande'}</button>
        </form>
        <aside className="h-fit border border-outline-variant bg-surface p-6"><h2 className="font-display text-headline-md text-primary">Votre commande</h2><div className="mt-5 space-y-3">{items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span>{item.quantity} × {item.name}</span><span className="whitespace-nowrap">{formatPrice(item.price * item.quantity)}</span></div>)}</div><div className="mt-6 space-y-3 border-t border-outline-variant pt-4 text-on-surface-variant"><div className="flex justify-between"><span>Sous-total</span><span>{formatPrice(subtotal)}</span></div><div className="flex justify-between"><span>Livraison</span><span>{formatPrice(deliveryFee)}</span></div><div className="flex justify-between font-display text-headline-md text-primary"><span>Total</span><span>{formatPrice(subtotal + deliveryFee)}</span></div></div></aside>
      </div>
    </section>
  );
}
