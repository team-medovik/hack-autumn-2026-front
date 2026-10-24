import { formatNumber } from '@/shared/lib/format';

interface FactorHintInput {
  behavior: string;
  value: number;
  saved: number;
  byDefault: number;
}

/** «всегда в полную силу / было 70 / по умолчанию 70» — «было» только у изменённого веса. */
export const factorHint = ({ behavior, value, saved, byDefault }: FactorHintInput) =>
  [
    behavior,
    value !== saved && `было ${formatNumber(saved)}`,
    `по умолчанию ${formatNumber(byDefault)}`,
  ]
    .filter(Boolean)
    .join(' / ');
