import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { ProgressBar, type ProgressBarTone } from '../../progress-bar';
import { Text } from '../../text';

import './reason-contribution.scss';

interface ReasonContributionProps {
  /** Причина, например «Ожидает оплаты, будет удалена завтра». */
  label: ReactNode;
  /** Вклад в score, например «+70». */
  value: ReactNode;
  /** Длина шкалы, 0–100 %. */
  percent: number;
  /** Цвет шкалы — обычно по уровню риска клиента. */
  tone?: ProgressBarTone;
  className?: string;
}

/**
 * Вклад причины в score (Причина / вклад).
 *
 * @example
 * <ReasonContribution label="Ожидает оплаты, будет удалена завтра" value="+70" percent={70} />
 */
export const ReasonContribution = ({
  label,
  value,
  percent,
  tone = 'danger-soft',
  className,
}: ReasonContributionProps) => (
  <div className={clsx('reason-contribution', className)}>
    <div className="reason-contribution__row">
      <Text variant="caption" color="main" className="reason-contribution__label">
        {label}
      </Text>
      <Text variant="body" color="main" className="reason-contribution__value">
        {value}
      </Text>
    </div>
    <ProgressBar value={percent} tone={tone} />
  </div>
);
