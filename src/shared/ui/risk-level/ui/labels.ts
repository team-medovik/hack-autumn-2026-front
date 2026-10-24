import type { RiskLevel } from '../../risk-score';

/** Порядок уровней риска на экране: от высокого к «нет оценки». */
export const RISK_LEVELS = [
  'high',
  'medium',
  'low',
  'none',
] as const satisfies readonly RiskLevel[];

/** Подписи уровней риска — общие для всех мест, где уровень называется словами. */
export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
  none: 'Нет оценки',
};
