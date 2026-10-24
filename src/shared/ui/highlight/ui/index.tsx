import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import './highlight.scss';

interface HighlightProps {
  /** Подсветка включена (в Figma — слой «Подсветка»: значение изменилось с прошлого снимка). */
  active?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * Подсветка значения фоном accent/highlight. Без `active` — просто обёртка без стилей.
 *
 * @example
 * <Highlight active={bucket.changed}>{formatMoney(bucket.monthlyLoss)}</Highlight>
 */
export const Highlight = ({ active = false, children, className }: HighlightProps) => (
  <span className={clsx('highlight', { 'highlight--active': active }, className)}>{children}</span>
);
