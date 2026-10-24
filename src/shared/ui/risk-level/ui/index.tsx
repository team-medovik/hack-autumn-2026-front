import { clsx } from 'clsx';

import type { RiskLevel as RiskLevelValue } from '../../risk-score';
import { Text } from '../../text';

import './risk-level.scss';

const LABELS: Record<RiskLevelValue, string> = {
  high: 'Высокий',
  medium: 'Средний',
  low: 'Низкий',
  none: 'Нет оценки',
};

interface RiskLevelProps {
  level: RiskLevelValue;
  className?: string;
}

/**
 * Уровень риска: цветной маркер + подпись.
 *
 * @example
 * <RiskLevel level="high" />
 */
export const RiskLevel = ({ level, className }: RiskLevelProps) => (
  <span className={clsx('risk-level', `risk-level--${level}`, className)}>
    <span className="risk-level__marker" aria-hidden />
    <Text as="span" variant="caption" color="main">
      {LABELS[level]}
    </Text>
  </span>
);
