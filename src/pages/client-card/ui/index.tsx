import { useMemo } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import {
  parseClientsQuery,
  useClientCard,
  useClientPosition,
  type ClientsListQuery,
} from '@/entities/client';
import { isNotFoundError } from '@/shared/api';
import { ROUTES } from '@/shared/config';
import { ClientCard, type ClientCardError } from '@/widgets/client-card';

/** Фильтр, поиск и сортировка таблицы под карточкой — по ним считаются соседи клиента. */
const useListQuery = (search: string): ClientsListQuery =>
  useMemo(() => {
    const { page: _page, ...query } = parseClientsQuery(new URLSearchParams(search));
    return query;
  }, [search]);

const toCardError = (error: unknown): ClientCardError | undefined => {
  if (!error) {
    return undefined;
  }
  return isNotFoundError(error) ? 'not-found' : 'unavailable';
};

/**
 * Карточка клиента — дочерний роут сводной таблицы: открывается окном поверх неё.
 * Параметры таблицы в URL сохраняются при переходах между клиентами и при закрытии.
 */
export const ClientCardPage = () => {
  const { clientId = '' } = useParams<{ clientId: string }>();
  const { search } = useLocation();
  const navigate = useNavigate();
  const listQuery = useListQuery(search);

  const { data: card, error, isFetching, refetch } = useClientCard(clientId);
  const { data: position } = useClientPosition(clientId, listQuery);

  return (
    <ClientCard
      card={card}
      error={toCardError(error)}
      isFetching={isFetching}
      onRetry={() => void refetch()}
      position={position}
      getClientLink={(id) => ({ pathname: ROUTES.client(id), search })}
      onClose={() => navigate({ pathname: ROUTES.clients, search })}
    />
  );
};
