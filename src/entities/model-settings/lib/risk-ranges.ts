import type { RiskLevel } from '@/shared/ui/risk-score';

import type { RiskThresholds } from '../model/types';

export type ScoredRiskLevel = Exclude<RiskLevel, 'none'>;

export interface RiskRange {
  level: ScoredRiskLevel;
  /** Включительно, целые баллы. */
  from: number;
  to: number;
  /** Длина диапазона на шкале 0–100 — доля ширины сегмента. */
  span: number;
}

const MAX_SCORE = 100;

/** Порог высокого строго больше порога среднего — иначе средний уровень пуст. */
export const isValidRiskThresholds = ({ medium, high }: RiskThresholds) => high > medium;

/** Диапазоны уровней от низкого к высокому: при 40 / 70 — 0–39, 40–69, 70–100. */
export const getRiskRanges = ({ medium, high }: RiskThresholds): RiskRange[] => [
  { level: 'low', from: 0, to: medium - 1, span: medium },
  { level: 'medium', from: medium, to: high - 1, span: high - medium },
  { level: 'high', from: high, to: MAX_SCORE, span: MAX_SCORE - high },
];

/** Сколько клиентов попадёт в каждый уровень при этих порогах. */
export const countClientsByLevel = (
  histogram: readonly number[],
  thresholds: RiskThresholds,
): Record<ScoredRiskLevel, number> => {
  const sum = (from: number, to: number) =>
    histogram.slice(from, to + 1).reduce((total, clients) => total + clients, 0);

  const [low, medium, high] = getRiskRanges(thresholds).map(({ from, to }) => sum(from, to));
  return { low, medium, high };
};
