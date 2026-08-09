import { categories } from '../data/catalog';
import { Link } from 'react-router-dom';
import { Icon } from './Icon';

export function CategoriesGrid() {
  const visibleCategories = categories.slice(0, 4);

  return (
    <section className="section-shell py-24">
      <div className="mb-16 text-center">
        <h2 className="mb-4 font-display text-headline-lg text-primary">L&apos;Essentiel par Catégorie</h2>
        <p className="text-body-md text-on-surface-variant">Explorez nos univers dédiés à votre bien-être.</p>
      </div>
      <div className="grid auto-rows-[300px] grid-cols-1 gap-gutter md:grid-cols-3">
        {visibleCategories.map((category, index) => (
          <article
            key={category.id}
            className={`group relative overflow-hidden rounded-xl shadow-sm transition-shadow hover:shadow-md ${
              category.featured ? 'md:col-span-2' : ''
            }`}
          >
            <img
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              src={category.image}
              alt={category.label}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/80 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 w-full p-6">
              <h3 className="mb-2 font-display text-headline-md text-on-primary">{category.label}</h3>
              <Link className="flex items-center gap-1 text-label-sm font-bold uppercase tracking-widest text-primary-fixed hover:underline" to={`/catalogue?category=${category.id}`}>
                {index === 0 ? 'Voir la sélection' : index === 1 ? 'Découvrir' : index === 2 ? 'Parcourir' : 'Explorer la tendance'}
                <Icon name="arrow_forward" className="text-[16px]" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
