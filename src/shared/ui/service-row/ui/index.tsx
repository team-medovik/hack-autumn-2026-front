import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { RiskScore, type RiskLevel } from '../../risk-score';
import { Text } from '../../text';

import './service-row.scss';

interface ServiceRowProps {
  score: number | null;
  level: RiskLevel;
  name: ReactNode;
  /** Подпись под названием, например «удалят 21.10, автопродление выкл.». */
  note?: ReactNode;
  /** Цена в месяц, например «9,90 €». */
  price?: ReactNode;
  /** Строка под подписью, например плашка прогноза. Риск и цена остаются по центру строки. */
  extra?: ReactNode;
  className?: string;
}

/**
 * Услуга в группе (слой «Услуга» в Figma): риск услуги, название с подписью, цена.
 *
 * @example
 * <ServiceRow score={94.2} level="high" name="service-0017" note="удалят 21.10" price="9,90 €" />
 * <ServiceRow … extra={<RenewalForecastBadge service={service} />} />
 */
export const ServiceRow = ({
  score,
  level,
  name,
  note,
  price,
  extra,
  className,
}: ServiceRowProps) => (
  <div className={clsx('service-row', className)}>
    <RiskScore score={score} level={level} />

    <span className="service-row__name">
      <Text as="span" variant="caption" color="main" truncate>
        {name}
      </Text>
      {note && (
        <Text as="span" variant="caption-2" color="tertiary" truncate>
          {note}
        </Text>
      )}
      {extra && <span className="service-row__extra">{extra}</span>}
    </span>

    {price && (
      <Text as="span" variant="caption" color="main" className="service-row__price">
        {price}
      </Text>
    )}
  </div>
);
