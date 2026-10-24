import { clsx } from 'clsx';
import type { ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  CLIENT_DATIVE_FORMS,
  countClients,
  type ClientSortField,
  type ClientsQuery,
  type ClientsResponse,
  type SortOrder,
} from '@/entities/client';
import { ROUTES } from '@/shared/config';
import { formatNumber, pluralize } from '@/shared/lib/format';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { Pagination } from '@/shared/ui/pagination';
import { StateMessage } from '@/shared/ui/state-message';
import { Table, TableMessageRow } from '@/shared/ui/table';

import { ClientTableRow } from './client-table-row';
import { ClientTableSkeletonRow } from './client-table-skeleton-row';
import { ClientsTableHeader } from './clients-table-header';

import './clients-table.scss';

/** Строк-скелетонов при первой загрузке — сколько помещается на страницу. */
const SKELETON_ROWS = 12;

interface ClientsTableProps {
  query: ClientsQuery;
  /** `undefined` — первая загрузка. */
  data?: ClientsResponse;
  isError: boolean;
  /** Идёт запрос: кнопка «Повторить» показывает загрузку. */
  isFetching: boolean;
  onRetry: () => void;
  onSortChange: (sort: ClientSortField, order: SortOrder) => void;
  onPageChange: (page: number) => void;
  onResetSearch: () => void;
  className?: string;
}

/**
 * Сводная таблица клиентов. Состояния по макетам «Сводная таблица (…)»:
 * загрузка — скелетоны; ошибка, «ничего не найдено» и «клиентов пока нет» — сообщение под шапкой.
 */
export const ClientsTable = ({
  query,
  data,
  isError,
  isFetching,
  onRetry,
  onSortChange,
  onPageChange,
  onResetSearch,
  className,
}: ClientsTableProps) => {
  const navigate = useNavigate();
  // До первого ответа шапка как в макете загрузки — с выбранной сортировкой
  const hasClients = !data || countClients(data.levelCounts) > 0;

  const renderBody = (): ReactNode => {
    if (!data) {
      return isError ? (
        <TableMessageRow>
          <StateMessage
            role="alert"
            icon={<Icon name="info-32" size={32} />}
            title="Не удалось загрузить клиентов"
            description="Сервер не ответил. Попробуйте ещё раз через минуту"
            action={
              <Button variant="secondary" active loading={isFetching} onClick={onRetry}>
                Повторить
              </Button>
            }
          />
        </TableMessageRow>
      ) : (
        Array.from({ length: SKELETON_ROWS }, (_, index) => <ClientTableSkeletonRow key={index} />)
      );
    }

    const totalClients = countClients(data.levelCounts);

    if (totalClients === 0) {
      return (
        <TableMessageRow>
          <StateMessage
            variant="hero"
            title="Клиентов пока нет"
            description="Таблица заполнится после загрузки снимка данных: ID, email, балансы, пополнения и риск."
            action={
              <Button asChild variant="primary">
                <Link to={ROUTES.snapshot}>Загрузить снимок</Link>
              </Button>
            }
          />
        </TableMessageRow>
      );
    }

    if (data.total === 0) {
      return (
        <TableMessageRow>
          {query.search ? (
            <StateMessage
              role="status"
              title={`По запросу «${query.search}» ничего не нашлось`}
              description={`Проверьте email или ID. Поиск идёт по всем ${formatNumber(totalClients)} ${pluralize(totalClients, CLIENT_DATIVE_FORMS)}, без учёта фильтра`}
              action={
                <Button variant="secondary" active onClick={onResetSearch}>
                  Сбросить поиск
                </Button>
              }
            />
          ) : (
            <StateMessage role="status" title="Клиентов с таким уровнем риска нет" />
          )}
        </TableMessageRow>
      );
    }

    return data.items.map((client) => (
      <ClientTableRow
        key={client.id}
        client={client}
        onOpen={(id) => navigate(ROUTES.client(id))}
      />
    ));
  };

  return (
    <section
      data-layer="card"
      aria-label="Сводная таблица"
      className={clsx('clients-table', className)}
    >
      <Table aria-label="Клиенты" aria-busy={isFetching}>
        <ClientsTableHeader
          sort={query.sort}
          order={query.order}
          showActiveSort={hasClients}
          onSortChange={onSortChange}
        />
        {renderBody()}
      </Table>

      {data && data.total > 0 && (
        <Pagination
          page={data.page}
          pageSize={data.pageSize}
          total={data.total}
          onPageChange={onPageChange}
        />
      )}
    </section>
  );
};
