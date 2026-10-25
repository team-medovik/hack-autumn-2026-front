import { getDataSourceKind, useDataSourceStatus } from '@/entities/data-source';
import { useIsAdmin } from '@/entities/session';
import { useSnapshots } from '@/entities/snapshot';
import { ImportSnapshot } from '@/features/import-snapshot';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatusScreen } from '@/shared/ui/status-screen';

import { CurrentSnapshot } from './current-snapshot';
import { SimulationSource } from './simulation-source';
import { SnapshotHistory } from './snapshot-history';

import './snapshot-manager.scss';

/** Пока история грузится — плашки на месте блоков: текущий снимок, зона загрузки, история. */
const SnapshotManagerSkeleton = () => (
  <div className="snapshot-manager" aria-busy>
    <Skeleton height={104} className="snapshot-manager__skeleton" />
    <Skeleton height={237} className="snapshot-manager__skeleton" />
    <Skeleton height={226} className="snapshot-manager__skeleton" />
  </div>
);

/**
 * «Импорт/экспорт снимка» по макетам «Импорт/экспорт снимка (…)»: текущий снимок со скачиванием
 * или живая симуляция, загрузка нового JSON и история загрузок. Файл до загрузки истории
 * не принимаем — не знаем, есть ли что заменять. Источник данных знает только администратор:
 * остальным — блок снимка без пояснения про AI-прогноз.
 */
export const SnapshotManager = () => {
  const { data: snapshots, isError, isFetching, refetch } = useSnapshots();
  const isAdmin = useIsAdmin();
  const { data: source } = useDataSourceStatus({ enabled: isAdmin });
  const sourceKind = source ? getDataSourceKind(source) : null;

  if (!snapshots) {
    return isError ? (
      <StatusScreen
        role="alert"
        title="Не удалось загрузить снимки"
        description="Сервер не ответил. Проверьте соединение и попробуйте ещё раз"
        action={
          <Button variant="primary" loading={isFetching} onClick={() => void refetch()}>
            Повторить
          </Button>
        }
      />
    ) : (
      <SnapshotManagerSkeleton />
    );
  }

  const current = snapshots.at(0) ?? null;

  return (
    <div className="snapshot-manager">
      {sourceKind === 'simulation' ? (
        <SimulationSource />
      ) : (
        <CurrentSnapshot snapshot={current} isActiveSource={sourceKind === 'snapshot'} />
      )}
      <ImportSnapshot
        currentFileName={current?.fileName ?? null}
        stopsSimulation={sourceKind === 'simulation'}
      />
      {snapshots.length > 0 && <SnapshotHistory snapshots={snapshots} />}
    </div>
  );
};
