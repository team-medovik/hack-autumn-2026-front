import type { ClientCardBalance, LossBreakdown, LossBreakdownItem } from '@/entities/client';
import { formatAmount, formatMoney, formatNumber } from '@/shared/lib/format';

/** Доли в формуле: k и непокрытая доля — до сотых, риск — до тысячных (как score: 94,2 → 0,942). */
const share = (value: number) => formatNumber(value, 2);

/** Расчёт потери услуги: «9,90 € × 0,942 × (0,5 + 0,5 × 0,35)». */
export const formatLossCalc = (
  { monthlyPrice, risk }: Pick<LossBreakdownItem, 'monthlyPrice' | 'risk'>,
  { k, uncoveredShare }: Pick<LossBreakdown, 'k' | 'uncoveredShare'>,
) =>
  `${formatMoney(monthlyPrice)} × ${formatNumber(risk, 3)} × ` +
  `(${share(k)} + ${share(1 - k)} × ${share(uncoveredShare)})`;

/**
 * Откуда непокрытая доля: «(9,90 − 6,48) / 9,90». Баланса хватает — `null`:
 * доля 0, вычитать нечего.
 */
export const formatUncoveredCalc = ({
  available,
  required,
}: Pick<ClientCardBalance, 'available' | 'required'>) =>
  required !== null && available < required
    ? `(${formatAmount(required)} − ${formatAmount(available)}) / ${formatAmount(required)}`
    : null;
