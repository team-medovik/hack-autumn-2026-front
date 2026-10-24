import { useId } from 'react';
import { Link } from 'react-router-dom';

import { FACTOR_TONE, type TopRiskClient } from '@/entities/dashboard';
import { ROUTES } from '@/shared/config';
import { formatMoney } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { ReasonContribution } from '@/shared/ui/reason-contribution';
import { RiskScore } from '@/shared/ui/risk-score';
import { SkeletonText } from '@/shared/ui/skeleton';
import { Stat, StatGroup } from '@/shared/ui/stat-group';
import { Text } from '@/shared/ui/text';

import './top-risk.scss';

interface TopRiskProps {
  /** `undefined` — загрузка, `null` — ни у кого нет риска. */
  data?: TopRiskClient | null;
  className?: string;
}

const TopRiskDetails = ({ client }: { client: TopRiskClient }) => {
  const shortage = Math.max(0, client.balance.required - client.balance.available);

  return (
    <>
      <div className="top-risk__client">
        <RiskScore score={client.score} level={client.level} size="l" />
        <div className="top-risk__identity">
          <Text variant="heading-3" as="p" color="main" truncate>
            {client.email}
          </Text>
          <Text variant="body" color="tertiary">
            ID {client.id}
          </Text>
        </div>
      </div>

      <ul className="top-risk__factors" aria-label="Из чего складывается риск">
        {client.factors.map((factor) => (
          <li key={factor.id}>
            <ReasonContribution
              label={factor.label}
              value={`+${factor.points}`}
              percent={factor.points}
              tone={FACTOR_TONE[client.level]}
            />
          </li>
        ))}
      </ul>

      <StatGroup aria-label="Баланс клиента">
        <Stat label="На счёте" value={formatMoney(client.balance.available)} />
        <Stat label="Нужно" value={formatMoney(client.balance.required)} />
        <Stat
          label="Не хватает"
          value={formatMoney(shortage)}
          tone={shortage > 0 ? 'danger' : 'main'}
        />
      </StatGroup>

      <Button asChild variant="primary" fullWidth>
        <Link to={ROUTES.client(client.id)}>Открыть карточку клиента</Link>
      </Button>
    </>
  );
};

/** Клиент с наибольшим риском: score, его причины, баланс и переход в карточку. */
export const TopRisk = ({ data, className }: TopRiskProps) => {
  const titleId = useId();

  const renderBody = () => {
    if (data === undefined) {
      return <SkeletonText />;
    }
    if (data === null) {
      return (
        <EmptyState
          title="Выделять некого"
          description="Ни у одного клиента нет риска. Клиент с наибольшим риском появится здесь сам"
        />
      );
    }
    return <TopRiskDetails client={data} />;
  };

  return (
    <Card className={className} aria-labelledby={titleId} aria-busy={data === undefined}>
      <CardHeader titleId={titleId} title="Наивысший риск" />
      {renderBody()}
    </Card>
  );
};
