import { clsx } from 'clsx';
import type { CSSProperties } from 'react';

import type { RiskLevel } from '../../risk-score';

import './risk-distribution.scss';

export interface RiskDistributionSegment {
  level: RiskLevel;
  /** Вес сегмента, например число клиентов. Нулевые сегменты не рисуются. */
  value: number;
}

interface RiskDistributionProps {
  segments: readonly RiskDistributionSegment[];
  /** Текстовое описание распределения для скринридера. */
  'aria-label': string;
  className?: string;
}

/**
 * Полоса распределения по уровням риска (Уровни риска / Segment).
 * Ширина сегмента пропорциональна `value`, «нет оценки» — пунктирный контур.
 *
 * @example
 * <RiskDistribution
 *   aria-label="Высокий — 13, средний — 14, низкий — 9, без оценки — 6"
 *   segments={[{ level: 'high', value: 13 }, { level: 'none', value: 6 }]}
 * />
 */
export const RiskDistribution = ({
  segments,
  'aria-label': ariaLabel,
  className,
}: RiskDistributionProps) => (
  <div className={clsx('risk-distribution', className)} role="img" aria-label={ariaLabel}>
    {segments
      .filter(({ value }) => value > 0)
      .map(({ level, value }) => (
        <span
          key={level}
          className={clsx('risk-distribution__segment', `risk-distribution__segment--${level}`)}
          style={{ '--segment-grow': value } as CSSProperties}
        />
      ))}
  </div>
);
