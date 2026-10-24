import { describe, expect, it } from 'vitest';

import {
  DEFAULT_CLIENTS_QUERY,
  parseClientsQuery,
  writeClientsQuery,
} from './clients-search-params';

describe('parseClientsQuery', () => {
  it('без параметров — значения по умолчанию', () => {
    expect(parseClientsQuery(new URLSearchParams())).toEqual(DEFAULT_CLIENTS_QUERY);
  });

  it('читает корректные параметры', () => {
    expect(
      parseClientsQuery(
        new URLSearchParams('level=high&search=%20client5%20&sort=email&order=asc&page=3'),
      ),
    ).toEqual({ level: 'high', search: 'client5', sort: 'email', order: 'asc', page: 3 });
  });

  it('мусор заменяет значениями по умолчанию', () => {
    expect(
      parseClientsQuery(new URLSearchParams('level=extreme&sort=name&order=up&page=-2')),
    ).toEqual(DEFAULT_CLIENTS_QUERY);
    expect(parseClientsQuery(new URLSearchParams('page=1.5')).page).toBe(1);
  });
});

describe('writeClientsQuery', () => {
  it('не пишет значения по умолчанию', () => {
    expect(writeClientsQuery(new URLSearchParams(), DEFAULT_CLIENTS_QUERY).toString()).toBe('');
  });

  it('пишет изменённые и убирает сброшенные параметры, чужие оставляет', () => {
    const params = writeClientsQuery(new URLSearchParams('mock=error&search=old&page=4'), {
      ...DEFAULT_CLIENTS_QUERY,
      level: 'low',
      order: 'asc',
    });

    expect(Object.fromEntries(params)).toEqual({ mock: 'error', level: 'low', order: 'asc' });
  });

  it('туда и обратно — то же самое', () => {
    const query = { level: 'none', search: 'mail', sort: 'topUp', order: 'asc', page: 2 } as const;
    expect(parseClientsQuery(writeClientsQuery(new URLSearchParams(), query))).toEqual(query);
  });
});
