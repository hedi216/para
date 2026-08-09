import type { ReactNode } from 'react';
import { Icon } from '../Icon';

type PosPageHeaderProps = {
  title: string;
  eyebrow?: string;
  children?: ReactNode;
};

export function PosPageHeader({ title, eyebrow = 'LOLA POS', children }: PosPageHeaderProps) {
  return (
    <header className="flex min-h-20 shrink-0 flex-col gap-4 border-b border-outline-variant bg-surface-container-lowest px-4 py-4 md:flex-row md:items-center md:justify-between md:px-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.1em] text-primary">{eyebrow}</p>
        <h1 className="font-display text-headline-md text-on-surface">{title}</h1>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {children}
        <div className="flex min-h-10 items-center gap-2 rounded-full bg-surface-container px-3 text-sm text-on-surface-variant">
          <Icon name="point_of_sale" className="text-[20px] text-primary" />
          Caisse 01
        </div>
      </div>
    </header>
  );
}
