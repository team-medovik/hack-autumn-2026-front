import { getShortage, type ClientCard } from '@/entities/client';
import { formatMoney } from '@/shared/lib/format';
import { Stat, StatGroup } from '@/shared/ui/stat-group';

/** Нет показателя — продлевать нечего. */
const EMPTY = '—';

interface ClientBalanceProps {
  card: Pick<ClientCard, 'balance' | 'lossBreakdown'>;
}

/**
 * Ряд «Балансы» под шапкой карточки: доступно на продления (основной баланс плюс бонусы и
 * реферальный, если их учитывают настройки модели), бонусы и реферальный справочно, нужно на
 * продления, нехватка, потеря.
 */
export const ClientBalance = ({ card: { balance, lossBreakdown } }: ClientBalanceProps) => {
  const shortage = getShortage(balance);

  return (
    <StatGroup aria-label="Баланс клиента" className="client-card__balances">
      <Stat label="Доступно" value={formatMoney(balance.available)} />
      <Stat label="Бонусы" value={formatMoney(balance.bonus)} muted />
      <Stat label="Реф. баланс" value={formatMoney(balance.referral)} muted />
      <Stat
        label={`Нужно за ${lossBreakdown.horizonDays}\u00a0дн.`}
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
  );
};
