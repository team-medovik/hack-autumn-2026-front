import { api } from '@/shared/api';

import type { CreateUserRequest, User } from '../model/types';

const URL = '/api/v1/users';

export const usersApi = {
  list: (): Promise<User[]> => api.get<User[]>(URL).then((response) => response.data),

  /** 409 — логин уже занят. */
  create: (request: CreateUserRequest): Promise<User> =>
    api.post<User>(URL, request).then((response) => response.data),

  /** 404 — пользователя уже нет (удалили в другой вкладке). */
  remove: (login: string): Promise<void> =>
    api.delete(`${URL}/${encodeURIComponent(login)}`).then(() => undefined),
};
