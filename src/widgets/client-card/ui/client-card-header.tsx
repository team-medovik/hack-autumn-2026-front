import type { To } from 'react-router-dom';

import type { ClientCard, ClientPosition } from '@/entities/client';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { ModalClose, ModalTitle } from '@/shared/ui/modal';
import { RiskLevel } from '@/shared/ui/risk-level';
import { RiskScore } from '@/shared/ui/risk-score';
import { Skeleton } from '@/shared/ui/skeleton';
import { Text } from '@/shared/ui/text';

import { ClientCardNav } from './client-card-nav';

interface ClientCardHeaderProps {
  /** `undefined` — загрузка или ошибка: вместо клиента скелетоны или пусто. */
  card?: ClientCard;
  isLoading: boolean;
  position?: ClientPosition;
  getClientLink: (id: string) => To;
}

const ClientIdentity = ({ card }: { card: ClientCard }) => (
  <>
    <RiskScore score={card.score} level={card.level} size="l" />
    <div className="client-card__identity">
      <ModalTitle>
        <Text variant="heading-3" as="h2" color="main" truncate>
          {card.email}
        </Text>
      </ModalTitle>
      <div className="client-card__meta">
        <Text as="span" variant="caption" color="secondary">
          ID {card.id}
        </Text>
        <RiskLevel level={card.level} />
      </div>
    </div>
  </>
);

const IdentitySkeleton = () => (
  <>
    <Skeleton width={124} height={66} />
    <div className="client-card__identity client-card__identity--loading">
      <Skeleton width={220} height={24} />
      <Skeleton width={140} height={14} className="client-card__skeleton-line" />
    </div>
  </>
);

/** Шапка: риск и клиент, навигация по списку, закрытие. */
export const ClientCardHeader = ({
  card,
  isLoading,
  position,
  getClientLink,
}: ClientCardHeaderProps) => {
  const renderIdentity = () => {
    if (card) {
      return <ClientIdentity card={card} />;
    }
    return (
      <>
        {/* Окну нужно имя и без данных клиента */}
        <ModalTitle>
          <h2 className="visually-hidden">Карточка клиента</h2>
        </ModalTitle>
        {isLoading ? <IdentitySkeleton /> : <div className="client-card__identity" />}
      </>
    );
  };

  return (
    <header className="client-card__header">
      {renderIdentity()}

      {position && <ClientCardNav position={position} getClientLink={getClientLink} />}

      <ModalClose>
        <Button variant="icon" aria-label="Закрыть">
          <Icon name="close" />
        </Button>
      </ModalClose>
    </header>
  );
};
