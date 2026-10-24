import { useQuery, type QueryClient } from '@tanstack/react-query';

import { snapshotsApi } from './snapshots.api';
import type { SnapshotRecord } from '../model/types';

export const snapshotsKeys = {
  all: ['snapshots'] as const,
} as const;

/** История загрузок, новые сверху; первая запись — текущий снимок. */
export const useSnapshots = () =>
  useQuery({
    queryKey: snapshotsKeys.all,
    queryFn: snapshotsApi.list,
  });

/** Новый снимок — сразу текущий и первый в истории, не дожидаясь перезапроса. */
export const addSnapshotToHistory = (queryClient: QueryClient, snapshot: SnapshotRecord) =>
  queryClient.setQueryData<SnapshotRecord[]>(snapshotsKeys.all, (snapshots) =>
    snapshots ? [snapshot, ...snapshots] : [snapshot],
  );
