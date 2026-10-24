import { describe, expect, it } from 'vitest';

import { getSnapshotStatus } from './snapshot-status';
import type { DashboardResponse } from './types';

const takenAt = '2026-10-23T19:10:00.000Z';
// Для статуса важен только снимок — остальные поля сводки не нужны
const withSnapshot = { snapshot: { id: 's1', takenAt } } as DashboardResponse;
const withoutSnapshot = { snapshot: null } as DashboardResponse;

describe('getSnapshotStatus', () => {
  it('без данных и без ошибки — загрузка', () => {
    expect(getSnapshotStatus({ data: undefined, isError: false })).toEqual({ kind: 'loading' });
  });

  it('без данных с ошибкой — сервер недоступен', () => {
    expect(getSnapshotStatus({ data: undefined, isError: true })).toEqual({ kind: 'unavailable' });
  });

  it('ответ без снимка — данных пока нет', () => {
    expect(getSnapshotStatus({ data: withoutSnapshot, isError: false })).toEqual({
      kind: 'empty',
    });
  });

  it('данные есть — актуальны, при ошибке фонового запроса — устарели', () => {
    expect(getSnapshotStatus({ data: withSnapshot, isError: false })).toEqual({
      kind: 'actual',
      takenAt,
    });
    expect(getSnapshotStatus({ data: withSnapshot, isError: true })).toEqual({
      kind: 'stale',
      takenAt,
    });
  });
});
