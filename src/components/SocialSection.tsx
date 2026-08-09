import { socialImages } from '../data/catalog';
import { Icon } from './Icon';

export function SocialSection() {
  return (
    <section className="section-shell py-24">
      <div className="mb-12 text-center">
        <h2 className="mb-2 font-display text-headline-lg text-primary">Suivez l&apos;univers LOLA</h2>
        <a className="inline-flex items-center gap-2 text-label-md font-semibold text-secondary transition-colors hover:text-primary" href="#">
          @lola_parapharmacie <Icon name="open_in_new" className="text-[18px]" />
        </a>
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {socialImages.map((image, index) => (
          <a key={image} href="#" className="group relative aspect-square overflow-hidden rounded-lg bg-surface-container-high" aria-label={`Publication Instagram LOLA ${index + 1}`}>
            <img className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" src={image} alt="" />
            <span className="absolute inset-0 flex items-center justify-center bg-on-surface/20 opacity-0 transition-opacity group-hover:opacity-100">
              <Icon name="favorite" filled className="text-[32px] text-on-primary" />
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
