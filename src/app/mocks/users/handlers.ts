import { delay, http, HttpResponse } from 'msw';

import {
  getLoginError,
  type CreatedUserResponse,
  type CreateUserRequest,
  type User,
} from '@/entities/user';
import { generatePassword } from '@/shared/lib/password';

import { publishChange } from '../realtime';

import { readMockScenario } from '../scenario';
import { INITIAL_USERS } from './fixtures';

/**
 * Сценарии /admin/users — по макетам «Настройки — пользователи (…)»: /settings?mock=users-error
 * main                — список, создание и удаление работают (по умолчанию)
 * users-loading       — список грузится бесконечно
 * users-error         — список не загрузился
 * users-create-error  — сервер не принимает создание
 * users-delete-error  — сервер не принимает удаление
 * Занятый логин — создайте «analyst»; выданный пароль и диалог удаления — состояния страницы.
 */
export const USERS_SCENARIOS = [
  'main',
  'users-loading',
  'users-error',
  'users-create-error',
  'users-delete-error',
] as const;

/** Кто работает в панели — логин из моков авторизации. */
const CURRENT_USER = 'admin';

// Состояние фейкового бэка: живёт до перезагрузки страницы (в тестах — сбрасывается)
let users: User[] = [...INITIAL_USERS];

export const resetUsersMock = () => {
  users = [...INITIAL_USERS];
};

const findByLogin = (login: string) =>
  users.find((user) => user.login.toLowerCase() === login.toLowerCase());

const serverUnavailable = () =>
  HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });

const scenario = () => readMockScenario(USERS_SCENARIOS, 'main');

export const usersHandlers = [
  http.get('*/api/v1/admin/users', async () => {
    if (scenario() === 'users-loading') {
      await delay('infinite');
    }
    await delay();

    if (scenario() === 'users-error') {
      return serverUnavailable();
    }
    return HttpResponse.json(users);
  }),

  http.post('*/api/v1/admin/users', async ({ request }) => {
    await delay();

    if (scenario() === 'users-create-error') {
      return serverUnavailable();
    }

    const {
      login,
      ssoUserId,
      role = 'EMPLOYEE',
      status = 'ACTIVE',
    } = (await request.json()) as CreateUserRequest;

    const ruleError = getLoginError(login);
    if (ruleError) {
      return HttpResponse.json({ message: ruleError }, { status: 400 });
    }
    if (findByLogin(login)) {
      return HttpResponse.json({ message: `Логин ${login} уже занят` }, { status: 409 });
    }

    const user: User = {
      id: crypto.randomUUID(),
      login: login.trim(),
      role,
      status,
      createdAt: new Date().toISOString(),
    };
    users = [...users, user];
    publishChange('ADMIN_USERS', user.id);
    return HttpResponse.json<CreatedUserResponse>(
      { ...user, ...(ssoUserId && { ssoUserId }), temporaryPassword: generatePassword() },
      { status: 201 },
    );
  }),

  http.delete('*/api/v1/admin/users/:id', async ({ params }) => {
    await delay();

    if (scenario() === 'users-delete-error') {
      return serverUnavailable();
    }

    const user = users.find(({ id }) => id === params.id);
    if (!user) {
      return HttpResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }
    if (user.login === CURRENT_USER) {
      return HttpResponse.json({ message: 'Нельзя удалить свою учётку' }, { status: 409 });
    }

    users = users.filter((item) => item !== user);
    publishChange('ADMIN_USERS', user.id);
    return new HttpResponse(null, { status: 204 });
  }),
];
