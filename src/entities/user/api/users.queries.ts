import { useQuery, type QueryClient } from '@tanstack/react-query';

import { usersApi } from './users.api';
import type { User } from '../model/types';

export const usersKeys = {
  all: ['users'] as const,
} as const;

/** Учётки сотрудников в порядке создания. */
export const useUsers = () =>
  useQuery({
    queryKey: usersKeys.all,
    queryFn: usersApi.list,
  });

/** Убрать удалённую учётку из списка. */
export const removeUserFromList = (queryClient: QueryClient, id: string) =>
  queryClient.setQueryData<User[]>(usersKeys.all, (users) =>
    users?.filter((user) => user.id !== id),
  );
