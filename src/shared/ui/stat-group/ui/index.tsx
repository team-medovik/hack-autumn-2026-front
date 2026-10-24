import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Text } from '../../text';

import './stat-group.scss';

interface StatGroupProps {
  children: ReactNode;
  /** Подпись группы для скринридера. */
  'aria-label'?: string;
  className?: string;
}

/**
 * Плашка с показателями в ряд (блок «Суммы» в Figma). Дочерние элементы — `<Stat>`.
 *
 * @example
 * <StatGroup aria-label="Баланс клиента">
 *   <Stat label="На счёте" value="0,00 €" />
 *   <Stat label="Не хватает" value="28,80 €" tone="danger" />
 * </StatGroup>
 */
export const StatGroup = ({ children, 'aria-label': ariaLabel, className }: StatGroupProps) => (
  <dl className={clsx('stat-group', className)} aria-label={ariaLabel}>
    {children}
  </dl>
);

interface StatProps {
  label: ReactNode;
  value: ReactNode;
  /** danger — значение цветом status/danger (например, «Не хватает»). */
  tone?: 'main' | 'danger';
}

/** Показатель: подпись Caption 2 и значение Label по центру. */
export const Stat = ({ label, value, tone = 'main' }: StatProps) => (
  <div className="stat-group__item">
    <Text as="dt" variant="caption-2" color="tertiary" truncate>
      {label}
    </Text>
    <Text as="dd" variant="label" color={tone} truncate className="stat-group__value">
      {value}
    </Text>
  </div>
);
