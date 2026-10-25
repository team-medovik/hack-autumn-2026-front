import { describe, expect, it } from 'vitest';

import { describeSyncError, getDataSourceKind } from './sync';
import type { DataSourceStatus, SyncProgress } from '../model/types';

const progress = (patch: Partial<SyncProgress> = {}): SyncProgress => ({
  sourceId: 'kotlin-api',
  runId: 'run-1',
  receivedSequence: 120,
  appliedSequence: 120,
  publishedAt: '2026-02-06T12:00:00Z',
  publishedRevision: 7,
  failureCount: 0,
  retryAfter: '2026-10-25T19:15:00Z',
  lastError: null,
  ...patch,
});

const status = (patch: Partial<DataSourceStatus> = {}): DataSourceStatus => ({
  enabled: true,
  usedForDashboard: true,
  progress: progress(),
  ...patch,
});

describe('getDataSourceKind', () => {
  it('живая симуляция — если дашборд считается по ней', () => {
    expect(getDataSourceKind(status())).toBe('simulation');
    expect(getDataSourceKind(status({ usedForDashboard: false }))).toBe('snapshot');
  });
});

describe('describeSyncError', () => {
  it('код ошибки — словами, с временем повтора', () => {
    expect(describeSyncError(progress({ lastError: 'APPLY_FAILED' }))).toMatch(
      /^Не получилось применить события генератора\. Повтор в \d{2}:\d{2}$/,
    );
  });

  it('неизвестный код — общей фразой, без ошибки — null', () => {
    expect(describeSyncError(progress({ lastError: 'BOOM' }))).toMatch(
      /^Не получилось обновить данные симуляции/,
    );
    expect(describeSyncError(progress())).toBeNull();
  });
});
