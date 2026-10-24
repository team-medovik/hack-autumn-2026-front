import type { User } from '@/entities/user';

// Данные повторяют макеты Figma «Настройки — пользователи (…)».

export const INITIAL_USERS: readonly User[] = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    login: 'admin',
    role: 'ADMIN',
    status: 'ACTIVE',
    createdAt: new Date(2026, 9, 1, 9, 0).toISOString(),
  },
  {
    id: '9d1f0c3e-2b4a-4c55-8e6f-2a7b9c0d1e2f',
    login: 'analyst',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: new Date(2026, 9, 20, 11, 30).toISOString(),
  },
  {
    id: '3b6e1f7a-8c2d-4e9f-a0b1-c2d3e4f5a6b7',
    login: 'manager',
    role: 'EMPLOYEE',
    status: 'ACTIVE',
    createdAt: new Date(2026, 9, 22, 16, 5).toISOString(),
  },
];
