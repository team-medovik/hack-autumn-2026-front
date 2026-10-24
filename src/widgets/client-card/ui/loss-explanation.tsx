import type { ClientCardBalance, LossBreakdown } from '@/entities/client';
import { formatMoney, formatNumber, formatPercent } from '@/shared/lib/format';
import { Breakdown, BreakdownDivider, BreakdownRow } from '@/shared/ui/breakdown';
import { Text } from '@/shared/ui/text';

import { formatLossCalc, formatUncoveredCalc } from '../lib/format-loss-calc';

interface LossExplanationProps {
  breakdown: LossBreakdown;
  balance: ClientCardBalance;
}

/**
 * Блоки окна «Как посчитана потеря» (макет «Карточка клиента (как посчитано)»):
 * формула, откуда непокрытая доля и потеря по каждой услуге с итогом.
 */
export const LossExplanation = ({ breakdown, balance }: LossExplanationProps) => {
  const { k, uncoveredShare, horizonDays, items } = breakdown;

  return (
    <>
      <Breakdown label="Формула">
        <Text color="main">
          Потеря услуги = цена в месяц × риск × (k + (1 − k) × непокрытая доля)
        </Text>
        <Text variant="caption" color="secondary">
          k = {formatNumber(k, 2)} — учёт баланса из настроек модели
        </Text>
      </Breakdown>

      {balance.required !== null && (
        <Breakdown label="Непокрытая доля">
          <BreakdownRow
            label={`Нужно на продления за ${horizonDays}\u00a0дн.`}
            value={formatMoney(balance.required)}
          />
          <BreakdownRow label="Основной баланс" value={formatMoney(balance.available)} />
          <BreakdownRow
            label="Бонусы"
            hint={formatMoney(balance.bonus)}
            value="заблокированы"
            mutedValue
          />
          <BreakdownRow
            label="Реферальный баланс"
            hint={formatMoney(balance.referral)}
            value="не идёт в продление"
            mutedValue
          />
          <BreakdownDivider />
          <BreakdownRow
            label="Не покрыто"
            hint={formatUncoveredCalc(balance) ?? 'баланса хватает на продления'}
            value={formatPercent(uncoveredShare)}
            accent
          />
        </Breakdown>
      )}

      <Breakdown label="Потеря по услугам">
        {items.length === 0 ? (
          <Text color="secondary">Живых услуг нет — продлевать нечего, поэтому потери нет</Text>
        ) : (
          <>
            {items.map((item) => (
              <BreakdownRow
                key={item.serviceId}
                label={item.serviceName}
                hint={formatLossCalc(item, breakdown)}
                value={formatMoney(item.loss)}
                accentValue
              />
            ))}
            <BreakdownDivider />
            <BreakdownRow label="Итого в месяц" value={formatMoney(balance.monthlyLoss)} accent />
          </>
        )}
      </Breakdown>
    </>
  );
};
