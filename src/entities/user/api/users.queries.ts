import { useQuery, type QueryClient } from '@tanstack/react-query';

import { usersApi } from './users.api';
import type { User } from '../model/types';

export const usersKeys = {
  all: ['users'] as const,
} as const;

/** Учётки панели в порядке создания: сначала из конфигурации, затем созданные в панели. */
export const useUsers = () =>
  useQuery({
    queryKey: usersKeys.all,
    queryFn: usersApi.list,
  });

/** Положить созданную учётку в конец списка — она видна сразу, без перезапроса. */
export const addUserToList = (queryClient: QueryClient, user: User) =>
  queryClient.setQueryData<User[]>(usersKeys.all, (users) => users && [...users, user]);

/** Убрать удалённую учётку из списка. */
export const removeUserFromList = (queryClient: QueryClient, login: string) =>
  queryClient.setQueryData<User[]>(usersKeys.all, (users) =>
    users?.filter((user) => user.login !== login),
  );
