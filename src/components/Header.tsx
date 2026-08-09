import logo from '../assets/logoLolla.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth-context';
import { useCart } from '../contexts/cart-context';
import { useCatalogCategories } from '../hooks/use-catalog-categories';
import { Icon } from './Icon';

type HeaderProps = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
};

export function Header({ searchQuery, onSearchChange }: HeaderProps) {
  const { categories } = useCatalogCategories();
  const navItems = categories.slice(0, 6);
  const { count: cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/catalogue${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ''}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface shadow-sm">
      <div className="section-shell flex w-full items-center justify-between gap-4 py-4">
        <Link className="flex items-center gap-3 text-primary" to="/" aria-label="LOLA Parapharmacie">
          <img src={logo} alt="LOLA Parapharmacie" className="h-12 w-12 rounded-full object-cover ring-1 ring-primary-container/50" />
          <span className="font-display text-[32px] leading-none tracking-normal md:text-[42px]">LOLA</span>
        </Link>

        <nav className="hidden items-center gap-gutter md:flex">
          {navItems.map((item) => (
            <Link key={item.id} className="text-label-md font-semibold uppercase tracking-[0.05em] text-secondary transition-colors hover:text-primary" to={`/catalogue?category=${item.id}`}>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-primary">
          <form onSubmit={submitSearch} className="hidden items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-2 transition focus-within:border-primary lg:flex">
            <Icon name="search" className="text-[20px]" />
            <input
              aria-label="Rechercher un produit"
              className="w-44 border-0 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </form>
          <Link to="/compte" aria-label="Compte client" className="transition-colors hover:text-primary-container">
            <Icon name="person" />
          </Link>
          <Link to="/panier" aria-label={`Panier, ${cartCount} article${cartCount > 1 ? 's' : ''}`} className="relative transition-colors hover:text-primary-container">
            <Icon name="shopping_bag" />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-on-primary">
                {cartCount}
              </span>
            )}
          </Link>
          <button aria-label="Menu" className="transition-colors hover:text-primary-container md:hidden">
            <Icon name="menu" />
          </button>
        </div>
      </div>
      <div className="section-shell pb-3 lg:hidden">
        <form onSubmit={submitSearch} className="flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-2 transition focus-within:border-primary">
          <Icon name="search" className="text-[20px]" />
          <input
            aria-label="Rechercher un produit"
            className="w-full border-0 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant"
            placeholder="Rechercher un soin, une marque..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </form>
      </div>
    </header>
  );
}
