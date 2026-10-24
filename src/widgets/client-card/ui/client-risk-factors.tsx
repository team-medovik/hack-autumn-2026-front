import type { ClientCard } from '@/entities/client';
import { FACTOR_TONE } from '@/entities/dashboard';
import { formatNumber } from '@/shared/lib/format';
import { ReasonContribution } from '@/shared/ui/reason-contribution';
import { RISK_LEVEL_LABELS } from '@/shared/ui/risk-level';
import { Text } from '@/shared/ui/text';

interface ClientRiskFactorsProps {
  card: Pick<ClientCard, 'level' | 'factors'>;
}

/** Почему у клиента такой риск: вклад каждого фактора в score или пояснение, почему оценки нет. */
export const ClientRiskFactors = ({ card: { level, factors } }: ClientRiskFactorsProps) => {
  if (factors.length === 0) {
    return (
      <Text variant="body" color="secondary">
        Оценки нет: у клиента не осталось живых услуг, все удалены или заблокированы. Продлевать
        нечего, поэтому риск не считается и в потери клиент не входит.
      </Text>
    );
  }

  return (
    <ul
      className="client-card__factors"
      aria-label={`Почему ${RISK_LEVEL_LABELS[level].toLowerCase()} риск`}
    >
      {factors.map((factor) => (
        <li key={factor.id}>
          <ReasonContribution
            label={factor.label}
            value={`+${formatNumber(factor.points)}`}
            percent={factor.points}
            tone={FACTOR_TONE[level]}
          />
        </li>
      ))}
    </ul>
  );
};
