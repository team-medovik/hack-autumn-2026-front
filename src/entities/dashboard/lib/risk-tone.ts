import type { ProgressBarTone } from '@/shared/ui/progress-bar';
import type { RiskLevel } from '@/shared/ui/risk-score';

/** Цвет шкалы вклада фактора в score клиента (Причина / вклад). */
export const FACTOR_TONE: Record<RiskLevel, ProgressBarTone> = {
  high: 'danger-soft',
  medium: 'risk-medium',
  low: 'risk-low',
  none: 'muted',
};

/** Цвет шкалы потерь по причине (Причина / потеря). */
export const LOSS_REASON_TONE: Record<RiskLevel, ProgressBarTone> = {
  high: 'danger',
  medium: 'risk-medium',
  low: 'risk-low',
  none: 'muted',
};
