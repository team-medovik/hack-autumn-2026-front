import { clsx } from 'clsx';
import { Fragment, type CSSProperties, type ReactNode } from 'react';

import { getNiceScale } from './scale';
import { Text } from '../../text';

import './column-chart.scss';

/** fact — сплошной серый, accent — сплошной danger, outline — пунктирный контур. */
export type ColumnVariant = 'fact' | 'accent' | 'outline';

export interface ColumnChartBar {
  id: string;
  value: number;
  variant: ColumnVariant;
  /** Подпись под столбцом. Без неё место остаётся пустым (подписи можно прореживать). */
  axisLabel?: string;
  /** Подпись над столбцом, например значение прогноза. */
  valueLabel?: ReactNode;
  /** Полное описание столбца для скринридера: «Неделя 31.08 — 9 услуг, факт». */
  description: string;
}

interface ColumnChartProps {
  bars: readonly ColumnChartBar[];
  /** Вертикальная линия-разделитель перед столбцом с индексом `beforeIndex`. */
  divider?: { beforeIndex: number; label: string };
  /** Название графика для скринридера. */
  'aria-label': string;
  className?: string;
}

const ratio = (value: number, max: number) => (max === 0 ? 0 : value / max);

/**
 * Столбчатый график со шкалой Y от нуля, сеткой и необязательным разделителем («сегодня»).
 * Визуальная часть скрыта от скринридера — вместо неё читается список `description`.
 *
 * @example
 * <ColumnChart
 *   aria-label="Отток услуг по неделям"
 *   divider={{ beforeIndex: 8, label: 'сегодня' }}
 *   bars={[{ id: '1', value: 9, variant: 'fact', axisLabel: '31.08', description: '…' }]}
 * />
 */
export const ColumnChart = ({
  bars,
  divider,
  'aria-label': ariaLabel,
  className,
}: ColumnChartProps) => {
  const scale = getNiceScale(Math.max(0, ...bars.map(({ value }) => value)));

  return (
    <figure className={clsx('column-chart', className)} aria-label={ariaLabel}>
      <div className="column-chart__plot" aria-hidden>
        <div className="column-chart__axis">
          {scale.ticks.map((tick) => (
            <Text
              key={tick}
              as="span"
              variant="caption-3"
              color="tertiary"
              className="column-chart__tick"
              style={{ '--tick-ratio': ratio(tick, scale.max) } as CSSProperties}
            >
              {tick}
            </Text>
          ))}
        </div>

        {scale.ticks.map((tick) => (
          <span
            key={tick}
            className={clsx('column-chart__grid-line', {
              'column-chart__grid-line--baseline': tick === 0,
            })}
            style={{ '--tick-ratio': ratio(tick, scale.max) } as CSSProperties}
          />
        ))}

        {bars.map((bar, index) => (
          <Fragment key={bar.id}>
            {divider?.beforeIndex === index && (
              <div className="column-chart__divider">
                <Text as="span" variant="caption-3" color="tertiary">
                  {divider.label}
                </Text>
                <span className="column-chart__divider-line" />
              </div>
            )}

            <div className="column-chart__column">
              <div className="column-chart__area">
                {bar.valueLabel !== undefined && (
                  <Text as="span" variant="caption-2" color="main">
                    {bar.valueLabel}
                  </Text>
                )}
                <span
                  className={clsx('column-chart__bar', `column-chart__bar--${bar.variant}`)}
                  style={{ '--bar-ratio': ratio(bar.value, scale.max) } as CSSProperties}
                />
              </div>
              <Text as="span" variant="caption-3" color="tertiary" className="column-chart__label">
                {bar.axisLabel ?? ' '}
              </Text>
            </div>
          </Fragment>
        ))}
      </div>

      <ul className="visually-hidden">
        {bars.map((bar) => (
          <li key={bar.id}>{bar.description}</li>
        ))}
      </ul>
    </figure>
  );
};

export interface ChartLegendItem {
  label: ReactNode;
  variant: ColumnVariant;
}

interface ChartLegendProps {
  items: readonly ChartLegendItem[];
  className?: string;
}

/** Легенда графика: квадратики 10×10 в стиле столбцов. */
export const ChartLegend = ({ items, className }: ChartLegendProps) => (
  <ul className={clsx('chart-legend', className)} aria-hidden>
    {items.map(({ label, variant }) => (
      <li key={variant} className="chart-legend__item">
        <span className={clsx('chart-legend__swatch', `column-chart__bar--${variant}`)} />
        <Text as="span" variant="caption-2" color="tertiary">
          {label}
        </Text>
      </li>
    ))}
  </ul>
);
