import { useCountUp } from '@/shared/lib/count-up';

interface CountUpProps {
  value: number;
  /** Как показать число: `formatMoney`, `formatNumber`… Применяется и к промежуточным кадрам. */
  format: (value: number) => string;
  /** Длительность досчёта, мс. */
  durationMs?: number;
}

/**
 * Число с досчётом от нуля (или от прошлого значения) до `value`.
 * Промежуточные кадры скрыты от скринридера — он сразу читает итог.
 *
 * @example
 * <Text variant="heading-1-italic"><CountUp value={data.monthlyLoss} format={formatMoney} /></Text>
 */
export const CountUp = ({ value, format, durationMs }: CountUpProps) => {
  const shown = useCountUp(value, { durationMs });

  return (
    <>
      <span aria-hidden>{format(shown)}</span>
      <span className="visually-hidden">{format(value)}</span>
    </>
  );
};
