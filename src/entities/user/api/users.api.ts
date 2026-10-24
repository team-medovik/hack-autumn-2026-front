import { createAdminUser, deleteAdminUser, listAdminUsers } from '@/shared/api';

import type { CreatedUserResponse, CreateUserRequest, User } from '../model/types';

export const usersApi = {
  list: (): Promise<User[]> => listAdminUsers(),

  /** Ответ — учётка и временный пароль, который больше не покажут. 409 — логин уже занят. */
  create: (request: CreateUserRequest): Promise<CreatedUserResponse> => createAdminUser(request),

  /** 404 — пользователя уже нет (удалили в другой вкладке). */
  remove: (id: string): Promise<void> => deleteAdminUser(encodeURIComponent(id)),
};
