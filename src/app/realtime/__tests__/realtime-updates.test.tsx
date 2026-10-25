import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { publishChange, resetRealtimeMock } from '@/app/mocks/realtime';
import { clientKeys } from '@/entities/client';
import { dashboardKeys } from '@/entities/dashboard';
import { modelSettingsKeys } from '@/entities/model-settings';
import { usersKeys } from '@/entities/user';
import type { RealtimeEntity } from '@/shared/api';

import { parseChangedEntity } from '../invalidate-changes';
import { RealtimeUpdates } from '../realtime-updates';

const KEYS = {
  dashboard: dashboardKeys.all,
  clients: clientKeys.card('42'),
  modelSettings: modelSettingsKeys.all,
  users: usersKeys.all,
};

type CachedQuery = keyof typeof KEYS;

/** Кэш с данными всех разделов — смотрим, какие из них событие пометит устаревшими. */
const renderWithCache = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  Object.values(KEYS).forEach((key) => queryClient.setQueryData(key, {}));

  const { unmount } = render(
    <QueryClientProvider client={queryClient}>
      <RealtimeUpdates />
    </QueryClientProvider>,
  );

  const invalidated = () =>
    (Object.keys(KEYS) as CachedQuery[]).filter(
      (name) => queryClient.getQueryState(KEYS[name])?.isInvalidated,
    );
  return { invalidated, unmount };
};

/** Поток открывается не сразу — шлём, пока событие не дойдёт. */
const publishUntil = async (
  entity: RealtimeEntity,
  invalidated: () => CachedQuery[],
  expected: CachedQuery[],
) =>
  waitFor(() => {
    publishChange(entity);
    expect(invalidated().sort()).toEqual([...expected].sort());
  });

describe('RealtimeUpdates', () => {
  afterEach(() => resetRealtimeMock());

  it('после правки сотрудников устаревает только их список', async () => {
    const { invalidated, unmount } = renderWithCache();
    await publishUntil('ADMIN_USERS', invalidated, ['users']);
    unmount();
  });

  it('после правки настроек модели устаревают настройки, дашборд и клиенты', async () => {
    const { invalidated, unmount } = renderWithCache();
    await publishUntil('MODEL_SETTINGS', invalidated, ['modelSettings', 'dashboard', 'clients']);
    unmount();
  });

  it('после нового снимка устаревает всё', async () => {
    const { invalidated, unmount } = renderWithCache();
    await publishUntil('SNAPSHOT', invalidated, ['modelSettings', 'dashboard', 'clients', 'users']);
    unmount();
  });
});

describe('parseChangedEntity', () => {
  it('читает сущность из тела события', () => {
    expect(parseChangedEntity('{"entity":"CALCULATION_DATE","id":null}')).toBe('CALCULATION_DATE');
  });

  it('незнакомую сущность и битое тело не угадывает', () => {
    expect(parseChangedEntity('{"entity":"SOMETHING_NEW"}')).toBeNull();
    expect(parseChangedEntity('not json')).toBeNull();
  });
});
