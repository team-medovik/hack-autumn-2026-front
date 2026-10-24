import { Indicator, Root } from '@radix-ui/react-progress';
import { clsx } from 'clsx';

import './progress-bar.scss';

/**
 * Цвет заполнения: danger — danger/default, danger-soft — status/danger,
 * risk-medium / risk-low — цвета уровней риска (оранжевый / бирюзовый), muted — text/tertiary.
 */
export type ProgressBarTone = 'danger' | 'danger-soft' | 'risk-medium' | 'risk-low' | 'muted';

interface ProgressBarProps {
  /** Заполнение в процентах 0–100. */
  value: number;
  tone?: ProgressBarTone;
  'aria-label'?: string;
  className?: string;
}

/**
 * Горизонтальная шкала 6px (слой «Шкала» в Причина / вклад и Причина / потеря).
 *
 * @example
 * <ProgressBar value={48} tone="danger" />
 */
export const ProgressBar = ({
  value,
  tone = 'danger',
  'aria-label': ariaLabel,
  className,
}: ProgressBarProps) => {
  const percent = Math.min(100, Math.max(0, value));

  return (
    <Root
      className={clsx('progress-bar', `progress-bar--${tone}`, className)}
      value={percent}
      aria-label={ariaLabel}
    >
      <Indicator className="progress-bar__indicator" style={{ width: `${percent}%` }} />
    </Root>
  );
};
