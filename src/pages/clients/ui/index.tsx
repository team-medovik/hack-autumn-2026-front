import { Outlet } from 'react-router-dom';

import { useClients } from '@/entities/client';
import { ClientSearch, LevelFilter } from '@/features/clients-filter';
import { ClientsTable } from '@/widgets/clients-table';

import { useClientsQuery } from '../model/use-clients-query';

import './clients-page.scss';

/**
 * Сводная таблица: фильтр по уровню риска и поиск, под ними — таблица клиентов.
 * В `<Outlet />` — карточка клиента окном поверх таблицы.
 */
export const ClientsPage = () => {
  const { query, setLevel, setSearch, setSort, setPage } = useClientsQuery();
  const { data, isError, isFetching, refetch } = useClients(query);

  return (
    <div className="clients-page">
      <h1 className="visually-hidden">Сводная таблица</h1>

      <div className="clients-page__filters">
        <LevelFilter
          value={query.level}
          onChange={setLevel}
          counts={data?.levelCounts}
          className="clients-page__levels"
        />
        <ClientSearch value={query.search} onChange={setSearch} className="clients-page__search" />
      </div>

      <ClientsTable
        query={query}
        data={data}
        isError={isError}
        isFetching={isFetching}
        onRetry={() => void refetch()}
        onSortChange={setSort}
        onPageChange={setPage}
        onResetSearch={() => setSearch('')}
      />

      <Outlet />
    </div>
  );
};
