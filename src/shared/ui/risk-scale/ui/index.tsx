import { clsx } from 'clsx';
import type { CSSProperties, ReactNode } from 'react';

import type { RiskLevel } from '../../risk-score';
import { Text } from '../../text';

import './risk-scale.scss';

export interface RiskScaleSegment {
  level: Exclude<RiskLevel, 'none'>;
  /** Доля ширины, например длина диапазона баллов. */
  weight: number;
  /** Подпись под полосой: «Низкий 0–39». */
  label: ReactNode;
  /** Пояснение рядом с подписью: «9 кл.». */
  note?: ReactNode;
}

interface RiskScaleProps {
  segments: readonly RiskScaleSegment[];
  'aria-label': string;
  className?: string;
}

/**
 * Шкала уровней риска по диапазонам баллов (Настройки / Шкала): цветная полоса и подпись под ней.
 *
 * @example
 * <RiskScale
 *   aria-label="Уровни риска при текущих порогах"
 *   segments={[{ level: 'low', weight: 40, label: 'Низкий 0–39', note: '9 кл.' }]}
 * />
 */
export const RiskScale = ({ segments, 'aria-label': ariaLabel, className }: RiskScaleProps) => (
  <ul className={clsx('risk-scale', className)} aria-label={ariaLabel}>
    {segments.map(({ level, weight, label, note }) => (
      <li
        key={level}
        className="risk-scale__segment"
        style={{ '--segment-grow': weight } as CSSProperties}
      >
        <span className={clsx('risk-scale__bar', `risk-scale__bar--${level}`)} aria-hidden />
        <span className="risk-scale__caption">
          <Text as="span" variant="caption" color="main">
            {label}
          </Text>
          {note && (
            <Text as="span" variant="caption" color="secondary">
              {note}
            </Text>
          )}
        </span>
      </li>
    ))}
  </ul>
);
