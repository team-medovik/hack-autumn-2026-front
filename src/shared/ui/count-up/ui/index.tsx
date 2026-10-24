import { useCountUp } from '@/shared/lib/count-up';
import { useRevealed } from '@/shared/lib/reveal';

interface CountUpProps {
  value: number;
  /** Как показать число: `formatMoney`, `formatNumber`… Применяется и к промежуточным кадрам. */
  format: (value: number) => string;
  /** Длительность досчёта, мс. */
  durationMs?: number;
}

/**
 * Число с досчётом от нуля (или от прошлого значения) до `value`. Внутри `<Reveal>` — после
 * появления блока на экране.
 * Промежуточные кадры скрыты от скринридера — он сразу читает итог.
 *
 * @example
 * <Text variant="heading-1-italic"><CountUp value={data.monthlyLoss} format={formatMoney} /></Text>
 */
export const CountUp = ({ value, format, durationMs }: CountUpProps) => {
  // Внутри <Reveal> досчёт начинается, когда блок показался
  const shown = useCountUp(value, { durationMs, paused: !useRevealed() });

  return (
    <>
      <span aria-hidden>{format(shown)}</span>
      <span className="visually-hidden">{format(value)}</span>
    </>
  );
};
