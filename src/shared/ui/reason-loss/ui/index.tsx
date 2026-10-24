import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { ProgressBar } from '../../progress-bar';
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
  /** Главная причина — красная шкала, остальные — серые. */
  primary?: boolean;
  className?: string;
}

/**
 * Потеря по причине (Причина / потеря). Свойство Figma «Главная» → `primary`.
 *
 * @example
 * <ReasonLoss label="Ожидает оплаты" amount="612,40 €" caption="16 клиентов" percent={48} primary />
 */
export const ReasonLoss = ({
  label,
  amount,
  caption,
  percent,
  primary = false,
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
    <ProgressBar value={percent} tone={primary ? 'danger' : 'muted'} />
    {caption && (
      <Text variant="caption-2" color="tertiary">
        {caption}
      </Text>
    )}
  </div>
);
