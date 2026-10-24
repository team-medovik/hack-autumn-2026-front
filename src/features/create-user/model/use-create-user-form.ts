import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { addUserToList, isSameLogin, usersApi, type CreateUserRequest } from '@/entities/user';
import { isConflictError } from '@/shared/api';
import { generatePassword } from '@/shared/lib/password';

const EMPTY: CreateUserRequest = { login: '', password: '' };

/**
 * Форма «Новый пользователь»: ввод, создание и показ созданных данных.
 * Пароль виден только после создания — сервер его больше не отдаст.
 */
export const useCreateUserForm = () => {
  const queryClient = useQueryClient();
  const [values, setValues] = useState(EMPTY);
  /** Логин, на котором сервер ответил «занят». Ошибка висит, пока его не поменяют. */
  const [takenLogin, setTakenLogin] = useState<string | null>(null);
  const [created, setCreated] = useState<CreateUserRequest | null>(null);

  const { mutate, isPending } = useMutation({
    mutationFn: usersApi.create,
    onSuccess: (user, { password }) => {
      addUserToList(queryClient, user);
      setCreated({ login: user.login, password });
      setValues(EMPTY);
      setTakenLogin(null);
    },
    onError: (error, { login }) => {
      if (isConflictError(error)) {
        setTakenLogin(login);
        return;
      }
      toast.error('Не удалось создать пользователя', {
        description: 'Сервер не ответил. Данные остались в форме — попробуйте ещё раз',
      });
    },
  });

  const login = values.login.trim();
  const loginError =
    takenLogin !== null && isSameLogin(login, takenLogin)
      ? `Логин ${takenLogin} уже занят`
      : undefined;

  return {
    values,
    setLogin: (next: string) => setValues((current) => ({ ...current, login: next })),
    setPassword: (next: string) => setValues((current) => ({ ...current, password: next })),
    generatePassword: () => setValues((current) => ({ ...current, password: generatePassword() })),

    loginError,
    isCreating: isPending,
    canCreate: login !== '' && values.password !== '' && !loginError && !isPending,
    create: () => mutate({ login, password: values.password }),

    /** Создан — показываем логин и пароль, пока админ не нажмёт «Готово». */
    created,
    finish: () => setCreated(null),
  };
};

export type CreateUserForm = ReturnType<typeof useCreateUserForm>;
