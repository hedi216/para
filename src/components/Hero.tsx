import { heroImage } from '../data/catalog';

export function Hero() {
  return (
    <section className="relative flex h-[640px] min-h-[500px] w-full items-center justify-center overflow-hidden bg-surface-container-low md:h-[716px]">
      <div className="absolute inset-0 z-0">
        <img
          className="h-full w-full object-cover opacity-60"
          src={heroImage}
          alt="Composition minimaliste de soins premium sur une surface claire"
        />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl space-y-6 px-margin-mobile text-center md:px-margin-desktop">
        <h1 className="font-display text-display-lg-mobile text-on-surface md:text-display-lg">Votre beauté, votre bien-être, notre expertise</h1>
        <p className="mx-auto max-w-xl text-body-lg text-on-surface-variant">
          Découvrez notre sélection pointue de soins dermo-cosmétiques pour une routine parfaite.
        </p>
        <a
          href="#catalogue"
          className="mt-8 inline-flex rounded-lg bg-primary px-8 py-3 text-label-md font-semibold uppercase tracking-[0.05em] text-on-primary shadow-sm transition-all hover:bg-surface-tint hover:shadow-md"
        >
          Découvrir
        </a>
      </div>
    </section>
  );
}
