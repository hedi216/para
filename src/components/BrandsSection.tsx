import { brands } from '../data/catalog';

export function BrandsSection() {
  return (
    <section className="border-y border-outline-variant bg-surface py-16">
      <div className="section-shell text-center">
        <p className="mb-8 text-label-sm font-bold uppercase tracking-widest text-secondary">Nos Marques Partenaires</p>
        <div className="flex flex-wrap items-center justify-center gap-10 opacity-60 grayscale transition-all duration-500 hover:grayscale-0 md:gap-16">
          {brands.slice(0, 8).map((brand) => (
            <span key={brand.id} className="font-display text-headline-md font-bold text-on-surface-variant">
              {brand.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
