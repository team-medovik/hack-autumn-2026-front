import type { LossBreakdown, LossBreakdownItem } from '@/entities/client';
import { formatMoney, formatNumber } from '@/shared/lib/format';

/** Доли в формуле: k и непокрытая доля — до сотых, риск — до тысячных (как score: 94,2 → 0,942). */
const share = (value: number) => formatNumber(value, 2);

/** «service-0017: 9,90 € × 0,942 × (0,5 + 0,5 × 0,35) = 6,27 €» */
export const formatLossLine = (
  { serviceName, monthlyPrice, risk, loss }: LossBreakdownItem,
  { k, uncoveredShare }: Pick<LossBreakdown, 'k' | 'uncoveredShare'>,
) =>
  `${serviceName}: ${formatMoney(monthlyPrice)} × ${formatNumber(risk, 3)} × ` +
  `(${share(k)} + ${share(1 - k)} × ${share(uncoveredShare)}) = ${formatMoney(loss)}`;
