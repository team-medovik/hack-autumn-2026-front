import type { ReactNode } from 'react';
import { Link, type To } from 'react-router-dom';

import type { ClientPosition } from '@/entities/client';
import { formatNumber } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

interface StepLinkProps {
  /** `null` — соседа нет или он ещё не известен: кнопка недоступна. */
  to: To | null;
  children: ReactNode;
}

/** Переход к соседу заменяет запись в истории: «назад» ведёт к таблице, а не по клиентам. */
const StepLink = ({ to, children }: StepLinkProps) =>
  to === null ? (
    <Button variant="secondary" disabled className="client-card__step">
      {children}
    </Button>
  ) : (
    <Button asChild variant="secondary" className="client-card__step">
      <Link to={to} replace>
        {children}
      </Link>
    </Button>
  );

interface ClientCardNavProps {
  position: ClientPosition;
  getClientLink: (id: string) => To;
}

/**
 * «Предыдущий · 2 из 42 · Следующий» — по списку сводной таблицы с её фильтром и сортировкой.
 * Клиента нет в списке (открыли по ссылке с другим фильтром) — навигации нет.
 */
export const ClientCardNav = ({ position, getClientLink }: ClientCardNavProps) => {
  const { index, total, prevId, nextId } = position;
  if (index === null) {
    return null;
  }

  return (
    <nav aria-label="Клиенты в списке" className="client-card__nav">
      <StepLink to={prevId === null ? null : getClientLink(prevId)}>Предыдущий</StepLink>
      <Text as="span" variant="caption" color="secondary" className="client-card__counter">
        {formatNumber(index)} из {formatNumber(total)}
      </Text>
      <StepLink to={nextId === null ? null : getClientLink(nextId)}>Следующий</StepLink>
    </nav>
  );
};
