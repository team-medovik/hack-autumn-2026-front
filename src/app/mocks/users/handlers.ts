import { delay, http, HttpResponse } from 'msw';

import type { CreateUserRequest, User } from '@/entities/user';

import { INITIAL_USERS } from './fixtures';
import { readMockScenario } from '../scenario';

/**
 * Сценарии /users — по макетам «Настройки — пользователи (…)»: /settings?mock=users-error
 * main                — список, создание и удаление работают (по умолчанию)
 * users-loading       — список грузится бесконечно
 * users-error         — список не загрузился
 * users-create-error  — сервер не принимает создание
 * users-delete-error  — сервер не принимает удаление
 * Занятый логин — создайте «analyst»; созданный пароль и диалог удаления — состояния страницы.
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

const findUser = (login: string) =>
  users.find((user) => user.login.toLowerCase() === login.toLowerCase());

const serverUnavailable = () =>
  HttpResponse.json({ message: 'Service Unavailable' }, { status: 503 });

const scenario = () => readMockScenario(USERS_SCENARIOS, 'main');

export const usersHandlers = [
  http.get('*/api/v1/users', async () => {
    if (scenario() === 'users-loading') {
      await delay('infinite');
    }
    await delay();

    if (scenario() === 'users-error') {
      return serverUnavailable();
    }
    return HttpResponse.json(users);
  }),

  http.post('*/api/v1/users', async ({ request }) => {
    await delay();

    if (scenario() === 'users-create-error') {
      return serverUnavailable();
    }

    const { login, password } = (await request.json()) as CreateUserRequest;

    if (!login.trim() || !password) {
      return HttpResponse.json({ message: 'Укажите логин и пароль' }, { status: 422 });
    }
    if (findUser(login)) {
      return HttpResponse.json({ message: `Логин ${login} уже занят` }, { status: 409 });
    }

    const user: User = {
      login: login.trim(),
      role: 'user',
      source: 'panel',
      createdAt: new Date().toISOString(),
      createdBy: CURRENT_USER,
    };
    users = [...users, user];
    return HttpResponse.json(user, { status: 201 });
  }),

  http.delete('*/api/v1/users/:login', async ({ params }) => {
    await delay();

    if (scenario() === 'users-delete-error') {
      return serverUnavailable();
    }

    const user = findUser(String(params.login));
    if (!user) {
      return HttpResponse.json({ message: 'Пользователь не найден' }, { status: 404 });
    }
    if (user.source === 'config' || user.login === CURRENT_USER) {
      return HttpResponse.json({ message: 'Эту учётку нельзя удалить из панели' }, { status: 403 });
    }

    users = users.filter((item) => item !== user);
    return new HttpResponse(null, { status: 204 });
  }),
];
