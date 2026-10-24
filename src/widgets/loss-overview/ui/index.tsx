import type { DashboardResponse } from '@/entities/dashboard';
import { formatMoney } from '@/shared/lib/format';
import { Card, CardHeader } from '@/shared/ui/card';
import { CountUp } from '@/shared/ui/count-up';
import { Highlight } from '@/shared/ui/highlight';
import { RiskDistribution } from '@/shared/ui/risk-distribution';
import { RISK_LEVEL_LABELS, RISK_LEVELS, RiskLevel } from '@/shared/ui/risk-level';
import { Skeleton } from '@/shared/ui/skeleton';
import { Text } from '@/shared/ui/text';

import './loss-overview.scss';

interface LossOverviewProps {
  /** `undefined` — данные загружаются, вместо чисел скелетоны. */
  data?: Pick<DashboardResponse, 'monthlyLoss' | 'riskBuckets'>;
}

/** Сводка потерь: сколько потеряем в месяц и распределение клиентов по уровням риска. */
export const LossOverview = ({ data }: LossOverviewProps) => {
  const buckets = RISK_LEVELS.map((level) => ({
    level,
    bucket: data?.riskBuckets.find((item) => item.level === level),
  }));

  const distributionLabel = buckets
    .map(
      ({ level, bucket }) => `${RISK_LEVEL_LABELS[level].toLowerCase()} — ${bucket?.clients ?? 0}`,
    )
    .join(', ');

  return (
    <Card className="loss-overview" aria-busy={!data}>
      <div className="loss-overview__total">
        <CardHeader
          title="Можем потерять в месяц"
          hint="Сумма ежемесячных платежей клиентов, которые, по прогнозу, не продлят услуги"
        />
        {data ? (
          <>
            <Text variant="heading-1-italic" color="main">
              <CountUp value={data.monthlyLoss} format={formatMoney} />
            </Text>
            <Text variant="body" color="main">
              {data.monthlyLoss > 0
                ? 'Выручка, которую потеряем за месяц, если ничего не делать'
                : 'Все клиенты платят вовремя'}
            </Text>
          </>
        ) : (
          <Skeleton width={151} height={44} />
        )}
      </div>

      <div className="loss-overview__levels">
        <CardHeader
          title="Уровни риска"
          hint="Клиенты по уровню риска не продлить услуги и их потери в месяц"
        />
        {data ? (
          <RiskDistribution
            aria-label={`Клиенты по уровням риска: ${distributionLabel}`}
            segments={buckets.map(({ level, bucket }) => ({ level, value: bucket?.clients ?? 0 }))}
          />
        ) : (
          <Skeleton height={10} className="loss-overview__distribution-skeleton" />
        )}

        <dl className="loss-overview__buckets">
          {buckets.map(({ level, bucket }) => (
            <div key={level} className="loss-overview__bucket">
              <dt className="loss-overview__bucket-title">
                {bucket ? (
                  <Text as="span" variant="body" color="main">
                    {bucket.clients} кл.
                  </Text>
                ) : (
                  <Skeleton width={37} height={16} />
                )}
                <RiskLevel level={level} />
              </dt>
              <dd className="loss-overview__bucket-loss">
                {bucket ? (
                  <Highlight active={bucket.changed}>
                    <Text as="span" variant="heading-3" color="main">
                      {bucket.monthlyLoss === null ? '—' : formatMoney(bucket.monthlyLoss)}
                    </Text>
                  </Highlight>
                ) : (
                  <Skeleton width={level === 'none' ? 24 : 74} height={24} />
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  );
};
