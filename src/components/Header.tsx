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
  const navItems = categories.slice(0, 5);
  const { count: cartCount } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const submitSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate(`/catalogue${searchQuery.trim() ? `?search=${encodeURIComponent(searchQuery.trim())}` : ''}`);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-outline-variant bg-surface shadow-sm">
      <div className="section-shell flex w-full items-center gap-3 py-3 md:gap-5">
        <Link className="flex shrink-0 items-center gap-2 text-primary md:gap-3" to="/" aria-label="LOLA Parapharmacie">
          <img src={logo} alt="LOLA Parapharmacie" className="h-10 w-10 rounded-full object-cover ring-1 ring-primary-container/50 md:h-11 md:w-11" />
          <span className="whitespace-nowrap font-display text-[30px] leading-none tracking-normal md:text-[36px]">LOLA</span>
        </Link>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-4 overflow-hidden md:flex lg:gap-6">
          {navItems.map((item) => (
            <Link key={item.id} className="whitespace-nowrap text-[12px] font-semibold uppercase tracking-[0.04em] text-secondary transition-colors hover:text-primary lg:text-label-md" to={`/catalogue?category=${item.id}`}>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 text-primary">
          <form onSubmit={submitSearch} className="hidden items-center gap-2 rounded-full border border-outline-variant bg-surface-container-lowest px-3 py-2 transition focus-within:border-primary xl:flex">
            <Icon name="search" className="text-[20px]" />
            <input
              aria-label="Rechercher un produit"
              className="w-36 border-0 bg-transparent text-sm text-on-surface outline-none placeholder:text-on-surface-variant 2xl:w-44"
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
