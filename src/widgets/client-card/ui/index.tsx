import type { To } from 'react-router-dom';

import type { ClientCard as ClientCardData, ClientPosition } from '@/entities/client';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Modal } from '@/shared/ui/modal';
import { StateMessage } from '@/shared/ui/state-message';

import { ClientBalance } from './client-balance';
import { ClientCardHeader } from './client-card-header';
import { ClientCardSkeleton } from './client-card-skeleton';
import { ClientRiskFactors } from './client-risk-factors';
import { ClientServices } from './client-services';
import { LossExplanationButton } from './loss-explanation-button';

import './client-card.scss';

/** not-found — клиента нет в снимке, unavailable — сервер не ответил. */
export type ClientCardError = 'not-found' | 'unavailable';

interface ClientCardProps {
  /** `undefined` — загрузка или ошибка. */
  card?: ClientCardData;
  error?: ClientCardError;
  /** Идёт запрос: кнопка «Повторить» показывает загрузку. */
  isFetching: boolean;
  onRetry: () => void;
  /** Место в списке таблицы. `undefined` — ещё неизвестно: навигации нет. */
  position?: ClientPosition;
  /** Ссылка на соседа для «Предыдущий / Следующий». */
  getClientLink: (id: string) => To;
  onClose: () => void;
}

const CardContent = ({ card }: { card: ClientCardData }) => (
  <>
    <ClientBalance card={card} />
    <div className="client-card__content">
      <div className="client-card__column">
        <ClientRiskFactors card={card} />
        <LossExplanationButton card={card} />
      </div>
      <div className="client-card__column">
        {/* key — у нового клиента группы раскрываются заново */}
        <ClientServices key={card.id} services={card.services} />
      </div>
    </div>
  </>
);

/**
 * Карточка клиента поверх сводной таблицы. Состояния по макетам «Карточка клиента (…)»:
 * данные, без оценки, загрузка (скелетоны) и окно «Как посчитано»; плюс ошибка и «не найден».
 */
export const ClientCard = ({
  card,
  error,
  isFetching,
  onRetry,
  position,
  getClientLink,
  onClose,
}: ClientCardProps) => {
  const isLoading = !card && !error;

  const renderBody = () => {
    if (card) {
      return <CardContent card={card} />;
    }
    if (error === 'not-found') {
      return (
        <StateMessage
          role="status"
          title="Клиент не найден"
          description="Возможно, его нет в последнем снимке данных"
          className="client-card__message"
        />
      );
    }
    if (error === 'unavailable') {
      return (
        <StateMessage
          role="alert"
          icon={<Icon name="info-32" size={32} />}
          title="Не удалось загрузить карточку"
          description="Сервер не ответил. Попробуйте ещё раз через минуту"
          action={
            <Button variant="secondary" active loading={isFetching} onClick={onRetry}>
              Повторить
            </Button>
          }
          className="client-card__message"
        />
      );
    }
    return <ClientCardSkeleton />;
  };

  return (
    <Modal open onOpenChange={(open) => !open && onClose()}>
      <article className="client-card" aria-busy={isLoading}>
        <ClientCardHeader
          card={card}
          isLoading={isLoading}
          position={position}
          getClientLink={getClientLink}
        />
        {renderBody()}
      </article>
    </Modal>
  );
};
