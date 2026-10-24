import type { ClientCardBalance, LossBreakdown } from '@/entities/client';
import { formatMoney, formatNumber, formatPercent } from '@/shared/lib/format';

import { formatLossLine } from '../lib/format-loss-line';

interface LossExplanationProps {
  breakdown: LossBreakdown;
  balance: ClientCardBalance;
}

/** Текст окна «Как посчитано»: формула, расчёт по каждой услуге, откуда непокрытая доля. */
export const LossExplanation = ({ breakdown, balance }: LossExplanationProps) => {
  const { k, uncoveredShare, items } = breakdown;

  return (
    <div className="client-card__explanation">
      <p>
        Потеря услуги = цена в месяц × риск × (k + (1 − k) × непокрытая доля), k ={' '}
        {formatNumber(k, 2)}.
      </p>

      {items.length === 0 ? (
        <p>Живых услуг нет — продлевать нечего, поэтому потери нет.</p>
      ) : (
        <>
          <div>
            {items.map((item) => (
              <p key={item.serviceId}>{formatLossLine(item, breakdown)}</p>
            ))}
          </div>
          {balance.required !== null && (
            <p>
              Непокрытая доля {formatPercent(uncoveredShare)}: на счёте{' '}
              {formatMoney(balance.available)} из нужных {formatMoney(balance.required)}.
            </p>
          )}
        </>
      )}
    </div>
  );
};
