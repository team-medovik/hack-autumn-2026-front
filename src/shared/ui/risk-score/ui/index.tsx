import { clsx } from 'clsx';

import { formatNumber } from '@/shared/lib/format';

import { Text } from '../../text';

import './risk-score.scss';

export type RiskLevel = 'high' | 'medium' | 'low' | 'none';

interface RiskScoreProps {
  /** Score 0–100. `null` — нет оценки (показывается «—»). */
  score: number | null;
  /** Цвет дуги. Без оценки (`none`) рисуется только трек. */
  level: RiskLevel;
  /** S — 52×32 для таблиц и списков, L — 124×66 для карточки клиента. */
  size?: 's' | 'l';
  className?: string;
}

// Полуокружности из Figma (Риск / дуга, Риск / L / дуга): центр, радиус и толщина линии
const ARC = {
  s: { width: 52, height: 32, cx: 26, cy: 28, r: 22, stroke: 4 },
  l: { width: 124, height: 65.76, cx: 62, cy: 62, r: 58.24, stroke: 7.52 },
} as const;

/**
 * Полукруг score 0–100 (Риск / S, Риск / L).
 * Длина дуги — dash по `pathLength=100`, как dashPattern слоя Value в Figma.
 *
 * @example
 * <RiskScore score={70} level="high" />
 * <RiskScore score={100} level="high" size="l" />
 * <RiskScore score={null} level="none" />
 */
export const RiskScore = ({ score, level, size = 's', className }: RiskScoreProps) => {
  const { width, height, cx, cy, r, stroke } = ARC[size];
  const value = score === null ? 0 : Math.min(100, Math.max(0, score));
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const hasValue = level !== 'none' && value > 0;
  // Score бывает дробным: 94,2
  const label = score === null ? '—' : formatNumber(value);

  return (
    <div
      className={clsx('risk-score', `risk-score--${size}`, `risk-score--${level}`, className)}
      role="meter"
      aria-label="Риск"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={score ?? undefined}
      aria-valuetext={score === null ? 'Нет оценки' : undefined}
    >
      <svg
        className="risk-score__arc"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        aria-hidden
      >
        <path className="risk-score__track" d={arc} strokeWidth={stroke} />
        {hasValue && (
          <path
            className="risk-score__value"
            d={arc}
            strokeWidth={stroke}
            pathLength={100}
            // Для 100 dash не нужен — иначе на концах видно стык
            strokeDasharray={value < 100 ? `${value} 200` : undefined}
          />
        )}
      </svg>

      {size === 's' ? (
        <Text
          as="span"
          variant="caption-2"
          color={level === 'none' ? 'tertiary' : 'main'}
          className="risk-score__label"
        >
          {label}
        </Text>
      ) : (
        <span className="risk-score__label">
          <Text as="span" variant="heading-3" color={level === 'none' ? 'tertiary' : 'main'}>
            {label}
          </Text>
          <Text as="span" variant="caption-2" color="secondary">
            /100
          </Text>
        </span>
      )}
    </div>
  );
};
