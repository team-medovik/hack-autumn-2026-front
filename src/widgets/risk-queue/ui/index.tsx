import { useId } from 'react';
import { Link } from 'react-router-dom';

import type { RiskQueue as RiskQueueData } from '@/entities/dashboard';
import { ROUTES } from '@/shared/config';
import { formatMoney } from '@/shared/lib/format';
import { Card, CardHeader } from '@/shared/ui/card';
import { ClientRow } from '@/shared/ui/client-row';
import { EmptyState } from '@/shared/ui/empty-state';
import { SkeletonText } from '@/shared/ui/skeleton';
import { Text } from '@/shared/ui/text';

import './risk-queue.scss';

interface RiskQueueProps {
  /** `undefined` — данные загружаются. */
  data?: RiskQueueData;
  /** Клиент, выделенный в списке, — тот, что показан в «Наивысшем риске». */
  selectedId?: string;
  className?: string;
}

/** Очередь клиентов по убыванию риска со ссылкой на полный список. */
export const RiskQueue = ({ data, selectedId, className }: RiskQueueProps) => {
  const titleId = useId();

  const renderBody = () => {
    if (!data) {
      return <SkeletonText />;
    }
    if (data.items.length === 0) {
      return (
        <EmptyState
          title="Очередь пуста"
          description="Все клиенты с низким риском и без ожидаемых потерь"
        />
      );
    }
    return (
      <ul className="risk-queue__list">
        {data.items.map((client) => (
          <li key={client.id}>
            <ClientRow
              as={Link}
              to={ROUTES.client(client.id)}
              score={client.score}
              level={client.level}
              email={client.email}
              clientId={`ID ${client.id}`}
              reason={client.reason}
              loss={formatMoney(client.monthlyLoss)}
              highlightLoss={client.lossChanged}
              selected={client.id === selectedId}
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
        title="Первыми под риском"
        aside={
          <Text
            as={Link}
            to={ROUTES.clients}
            variant="body"
            color="secondary"
            className="risk-queue__all"
          >
            Все клиенты{' '}
            <span className="risk-queue__arrow" aria-hidden>
              →
            </span>
          </Text>
        }
      />
      {renderBody()}
    </Card>
  );
};
