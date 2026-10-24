import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import type { ComponentProps, ReactNode } from 'react';

import './panel.scss';

type PanelProps = ComponentProps<'div'> & {
  children: ReactNode;
  /** Отрендерить панель на дочернем элементе (Radix Slot), например `<section>` или `<form>`. */
  asChild?: boolean;
};

/**
 * @example
 * <Panel>…</Panel>
 * <Panel asChild><form onSubmit={…}>…</form></Panel>
 */
export const Panel = ({ children, asChild = false, className, ...props }: PanelProps) => {
  const Component = asChild ? Slot : 'div';

  return (
    <Component data-layer="panel" className={clsx('panel', className)} {...props}>
      {children}
    </Component>
  );
};
