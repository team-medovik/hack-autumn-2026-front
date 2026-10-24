import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { ProgressBar, type ProgressBarTone } from '../../progress-bar';
import { Text } from '../../text';

import './reason-loss.scss';

interface ReasonLossProps {
  /** Причина, например «Ожидает оплаты». */
  label: ReactNode;
  /** Сумма потери, например «612,40 €». */
  amount: ReactNode;
  /** Подпись под шкалой, например «16 клиентов». */
  caption?: ReactNode;
  /** Длина шкалы, 0–100 %. */
  percent: number;
  /** Цвет шкалы. В Figma: «Главная=Да» — danger, «Главная=Нет» — muted. */
  tone?: ProgressBarTone;
  className?: string;
}

/**
 * Потеря по причине (Причина / потеря).
 *
 * @example
 * <ReasonLoss label="Ожидает оплаты" amount="612,40 €" caption="16 клиентов" percent={48} />
 */
export const ReasonLoss = ({
  label,
  amount,
  caption,
  percent,
  tone = 'danger',
  className,
}: ReasonLossProps) => (
  <div className={clsx('reason-loss', className)}>
    <div className="reason-loss__row">
      <Text variant="caption" color="main" className="reason-loss__label">
        {label}
      </Text>
      <Text variant="caption" color="main" className="reason-loss__amount">
        {amount}
      </Text>
    </div>
    <ProgressBar value={percent} tone={tone} />
    {caption && (
      <Text variant="caption-2" color="tertiary">
        {caption}
      </Text>
    )}
  </div>
);
