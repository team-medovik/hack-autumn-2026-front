import { describe, expect, it } from 'vitest';

import { canDeleteUser, getLoginError, isSameLogin, isValidLogin } from './user-rules';
import type { User } from '../model/types';

const analyst: User = {
  id: '9d1f0c3e-2b4a-4c55-8e6f-2a7b9c0d1e2f',
  login: 'analyst',
  role: 'EMPLOYEE',
  status: 'ACTIVE',
  createdAt: '2026-10-20T09:00:00.000Z',
};

describe('isSameLogin', () => {
  it('сравнивает без учёта регистра', () => {
    expect(isSameLogin('Analyst', 'analyst')).toBe(true);
    expect(isSameLogin('analyst', 'analyst2')).toBe(false);
  });
});

describe('canDeleteUser', () => {
  it('разрешает удалить другого', () => {
    expect(canDeleteUser(analyst, 'admin')).toBe(true);
  });

  it('не даёт удалить себя', () => {
    expect(canDeleteUser(analyst, 'Analyst')).toBe(false);
  });
});

describe('isValidLogin', () => {
  it('принимает от 3 до 255 символов без пробелов по краям', () => {
    expect(isValidLogin('ann')).toBe(true);
    expect(isValidLogin('  an  ')).toBe(false);
    expect(isValidLogin('a'.repeat(255))).toBe(true);
    expect(isValidLogin('a'.repeat(256))).toBe(false);
  });
});

describe('getLoginError', () => {
  it('называет только нарушенную границу', () => {
    expect(getLoginError('ab')).toBe('Логин — от 3 символов');
    expect(getLoginError('a'.repeat(256))).toBe('Логин — до 255 символов');
    expect(getLoginError('ann')).toBeNull();
  });
});
