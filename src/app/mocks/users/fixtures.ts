import type { User } from '@/entities/user';

// Данные повторяют макеты Figma «Настройки — пользователи (…)».

export const INITIAL_USERS: readonly User[] = [
  { login: 'admin', role: 'admin', source: 'config', createdAt: null, createdBy: null },
  {
    login: 'analyst',
    role: 'user',
    source: 'panel',
    createdAt: new Date(2026, 9, 20, 11, 30).toISOString(),
    createdBy: 'admin',
  },
  {
    login: 'manager',
    role: 'user',
    source: 'panel',
    createdAt: new Date(2026, 9, 22, 16, 5).toISOString(),
    createdBy: 'admin',
  },
];
