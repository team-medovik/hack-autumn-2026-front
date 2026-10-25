import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import './badge.scss';

/** neutral — значение («Прогноз непродления 68 %»); muted — значения нет («Нет прогноза»). */
export type BadgeTone = 'neutral' | 'muted';

interface BadgeProps {
  tone?: BadgeTone;
  /** Текст Caption 2. Часть другим стилем (подпись Caption 3) — своим `<Text as="span">`. */
  children: ReactNode;
  className?: string;
}

/**
 * Плашка-«пилюля» в одну строку на control/default (слой «Прогноз непродления / Плашка»).
 *
 * @example
 * <Badge>Прогноз непродления 68 %</Badge>
 * <Badge tone="muted">Нет прогноза</Badge>
 */
export const Badge = ({ tone = 'neutral', children, className }: BadgeProps) => (
  <span className={clsx('badge', `badge--${tone}`, className)}>{children}</span>
);
