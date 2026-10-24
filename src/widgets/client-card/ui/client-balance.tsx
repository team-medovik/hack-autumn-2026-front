import { getShortage, type ClientCard } from '@/entities/client';
import { formatMoney } from '@/shared/lib/format';
import { Dialog } from '@/shared/ui/dialog';
import { Stat, StatGroup } from '@/shared/ui/stat-group';
import { TextButton } from '@/shared/ui/text-button';

import { LossExplanation } from './loss-explanation';

/** Нет показателя — продлевать нечего. */
const EMPTY = '—';

interface ClientBalanceProps {
  card: Pick<ClientCard, 'balance' | 'lossBreakdown'>;
}

/** Деньги клиента: баланс, нужно на продления, нехватка, потеря — и как посчитана потеря. */
export const ClientBalance = ({ card: { balance, lossBreakdown } }: ClientBalanceProps) => {
  const shortage = getShortage(balance);

  return (
    <div className="client-card__money">
      <StatGroup aria-label="Баланс клиента">
        <Stat label="На счёте" value={formatMoney(balance.available)} />
        <Stat
          label="Нужно"
          value={balance.required === null ? EMPTY : formatMoney(balance.required)}
          tone={balance.required === null ? 'tertiary' : 'main'}
        />
        <Stat
          label="Не хватает"
          value={shortage === null ? EMPTY : formatMoney(shortage)}
          tone={shortage === null ? 'tertiary' : shortage > 0 ? 'danger' : 'main'}
        />
        <Stat label="Потеря / мес" value={formatMoney(balance.monthlyLoss)} />
      </StatGroup>

      <Dialog
        variant="info"
        size="l"
        title={`Как посчитана потеря ${formatMoney(balance.monthlyLoss)} в месяц`}
        description={<LossExplanation breakdown={lossBreakdown} balance={balance} />}
        trigger={<TextButton>Как посчитано</TextButton>}
      />
    </div>
  );
};
