import { describe, expect, it } from 'vitest';

import { canDeleteUser, isSameLogin } from './user-rules';
import type { User } from '../model/types';

const admin: User = {
  login: 'admin',
  role: 'admin',
  source: 'config',
  createdAt: null,
  createdBy: null,
};

const analyst: User = {
  login: 'analyst',
  role: 'user',
  source: 'panel',
  createdAt: '2026-10-20T09:00:00.000Z',
  createdBy: 'admin',
};

describe('isSameLogin', () => {
  it('сравнивает без учёта регистра', () => {
    expect(isSameLogin('Analyst', 'analyst')).toBe(true);
    expect(isSameLogin('analyst', 'analyst2')).toBe(false);
  });
});

describe('canDeleteUser', () => {
  it('разрешает удалить созданного в панели', () => {
    expect(canDeleteUser(analyst, 'admin')).toBe(true);
  });

  it('не даёт удалить учётку из конфигурации', () => {
    expect(canDeleteUser(admin, 'manager')).toBe(false);
  });

  it('не даёт удалить себя', () => {
    expect(canDeleteUser(analyst, 'Analyst')).toBe(false);
  });
});
