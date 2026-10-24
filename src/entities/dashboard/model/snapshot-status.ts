import type { DashboardResponse } from './types';
import { useDashboard } from '../api/dashboard.queries';

/**
 * Состояние данных для подписи в навбаре:
 * - loading — первая загрузка;
 * - unavailable — данных нет, сервер не ответил;
 * - empty — снимков ещё не загружали;
 * - actual — данные свежие;
 * - stale — показываем последние данные, но сервер перестал отвечать.
 */
export type SnapshotStatus =
  | { kind: 'loading' }
  | { kind: 'unavailable' }
  | { kind: 'empty' }
  | { kind: 'actual'; takenAt: string }
  | { kind: 'stale'; takenAt: string };

interface DashboardQueryState {
  data: DashboardResponse | undefined;
  isError: boolean;
}

export const getSnapshotStatus = ({ data, isError }: DashboardQueryState): SnapshotStatus => {
  if (!data) {
    return { kind: isError ? 'unavailable' : 'loading' };
  }
  if (!data.snapshot) {
    return { kind: 'empty' };
  }
  return { kind: isError ? 'stale' : 'actual', takenAt: data.snapshot.takenAt };
};

/** Состояние снимка на основе общего запроса сводки. */
export const useSnapshotStatus = () => getSnapshotStatus(useDashboard());
