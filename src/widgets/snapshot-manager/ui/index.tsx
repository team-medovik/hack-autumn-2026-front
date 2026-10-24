import { useSnapshots } from '@/entities/snapshot';
import { ImportSnapshot } from '@/features/import-snapshot';
import { Button } from '@/shared/ui/button';
import { Skeleton } from '@/shared/ui/skeleton';
import { StatusScreen } from '@/shared/ui/status-screen';

import { CurrentSnapshot } from './current-snapshot';
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
 * «Импорт/экспорт снимка» по макетам «Импорт/экспорт снимка (…)»: текущий снимок со скачиванием,
 * загрузка нового JSON и история загрузок. Файл до загрузки истории не принимаем — не знаем,
 * есть ли что заменять.
 */
export const SnapshotManager = () => {
  const { data: snapshots, isError, isFetching, refetch } = useSnapshots();

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
      <CurrentSnapshot snapshot={current} />
      <ImportSnapshot currentFileName={current?.fileName ?? null} />
      {snapshots.length > 0 && <SnapshotHistory snapshots={snapshots} />}
    </div>
  );
};
