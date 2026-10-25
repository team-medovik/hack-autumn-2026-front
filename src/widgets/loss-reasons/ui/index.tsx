import { useId } from 'react';

import { LOSS_REASON_TONE, type LossReason } from '@/entities/dashboard';
import { CLIENT_FORMS } from '@/shared/config';
import { formatCount, formatMoney } from '@/shared/lib/format';
import { Card, CardHeader } from '@/shared/ui/card';
import { EmptyState } from '@/shared/ui/empty-state';
import { ReasonLoss } from '@/shared/ui/reason-loss';
import { SkeletonText } from '@/shared/ui/skeleton';

import './loss-reasons.scss';

interface LossReasonsProps {
  /** `undefined` — данные загружаются. */
  data?: LossReason[];
  className?: string;
}

/** Потери в месяц по главной причине клиента. Шкала — доля причины в общей сумме. */
export const LossReasons = ({ data, className }: LossReasonsProps) => {
  const titleId = useId();

  const renderBody = () => {
    if (!data) {
      return <SkeletonText />;
    }
    if (data.length === 0) {
      return <EmptyState title="Потерь нет" description="Разбивать по причинам нечего" />;
    }

    const total = data.reduce((sum, reason) => sum + reason.monthlyLoss, 0);

    return (
      <ul className="loss-reasons__list">
        {data.map((reason) => (
          <li key={reason.id}>
            <ReasonLoss
              label={reason.label}
              amount={formatMoney(reason.monthlyLoss)}
              caption={formatCount(reason.clients, CLIENT_FORMS)}
              percent={total > 0 ? (reason.monthlyLoss / total) * 100 : 0}
              tone={LOSS_REASON_TONE[reason.level]}
            />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className={className} aria-labelledby={titleId} aria-busy={!data}>
      <CardHeader
        titleId={titleId}
        title="Причины потерь"
        hint="Каждый клиент учитывается один раз — по причине, которая сильнее всего влияет на его риск"
        description="Потери в месяц по главной причине клиента"
      />
      {renderBody()}
    </Card>
  );
};
