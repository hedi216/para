import logo from '../assets/logoLolla.jpg';
import { categories } from '../data/catalog';
import { Icon } from './Icon';

type HeaderProps = {
  cartCount: number;
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export function Header({ cartCount, searchQuery, onSearchChange }: HeaderProps) {
  const navItems = categories.slice(0, 6);

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface shadow-sm">
      <div className="section-shell flex w-full items-center justify-between gap-4 py-4">
        <a className="flex items-center gap-3 text-primary" href="#" aria-label="LOLA Parapharmacie">
          <img src={logo} alt="LOLA Parapharmacie" className="h-12 w-12 rounded-full object-cover ring-1 ring-primary-container/50" />
          <span className="font-display text-[32px] leading-none tracking-normal md:text-[42px]">LOLA</span>
        </a>

        <nav className="hidden items-center gap-gutter md:flex">
          {navItems.map((item) => (
            <a key={item.id} className="text-label-md font-semibold uppercase tracking-[0.05em] text-secondary transition-colors hover:text-primary" href="#catalogue">
              {item.name}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-primary">
          <label className="hidden items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-2 transition focus-within:border-primary lg:flex">
            <Icon name="search" className="text-[20px]" />
            <input
              aria-label="Rechercher un produit"
              className="w-44 border-0 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
          <button aria-label="Compte client" className="transition-colors hover:text-primary-container">
            <Icon name="person" />
          </button>
          <button aria-label={`Panier, ${cartCount} article${cartCount > 1 ? 's' : ''}`} className="relative transition-colors hover:text-primary-container">
            <Icon name="shopping_bag" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
                {cartCount}
              </span>
            )}
          </button>
          <button aria-label="Menu" className="transition-colors hover:text-primary-container md:hidden">
            <Icon name="menu" />
          </button>
        </div>
      </div>
      <div className="section-shell pb-3 lg:hidden">
        <label className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-2 transition focus-within:border-primary">
          <Icon name="search" className="text-[20px]" />
          <input
            aria-label="Rechercher un produit"
            className="w-full border-0 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
            placeholder="Rechercher un soin, une marque..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>
      </div>
    </header>
  );
}
