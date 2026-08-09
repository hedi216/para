import logo from '../assets/logoLolla.jpg';
import { Icon } from './Icon';

export function Footer() {
  const links = ['À propos', 'Contact', 'Livraison', 'Confidentialité'];

  return (
    <footer className="bg-surface-container-highest py-12">
      <div className="section-shell grid grid-cols-1 gap-gutter text-center md:grid-cols-3 md:text-left">
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3 md:justify-start">
            <img src={logo} alt="" className="h-12 w-12 rounded-full object-cover ring-1 ring-primary-container/50" />
            <h3 className="font-display text-headline-md text-primary">LOLA</h3>
          </div>
          <p className="mx-auto max-w-xs text-body-md text-on-surface-variant md:mx-0">
            Votre parapharmacie de confiance pour une beauté saine et experte.
          </p>
        </div>
        <div className="space-y-4">
          <h4 className="text-label-sm font-bold uppercase tracking-widest text-on-surface">Liens utiles</h4>
          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <a key={link} className="text-body-md text-on-secondary-container transition-opacity duration-200 hover:text-primary" href="#">
                {link}
              </a>
            ))}
          </nav>
        </div>
        <div className="space-y-4">
          <h4 className="text-label-sm font-bold uppercase tracking-widest text-on-surface">Nous trouver</h4>
          <p className="flex items-center justify-center gap-2 text-body-md text-on-surface-variant md:justify-start">
            <Icon name="location_on" className="text-[18px]" />
            2 Rue Dr Moreau, Sousse
          </p>
          <div className="mt-4 border-t border-outline-variant/30 pt-4">
            <p className="text-label-sm font-bold text-on-surface-variant">© 2026 LOLA Parapharmacie. 2 Rue Dr Moreau, Sousse, Tunisie.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
