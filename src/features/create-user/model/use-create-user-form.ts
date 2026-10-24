import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import {
  addUserToList,
  isSameLogin,
  getLoginError,
  usersApi,
  type CreateUserRequest,
} from '@/entities/user';
import { isConflictError } from '@/shared/api';
import { generatePassword, getPasswordError } from '@/shared/lib/password';

const EMPTY: CreateUserRequest = { login: '', password: '' };

type Field = keyof CreateUserRequest;

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
  /** Ошибки правил показываем, когда с поля ушли, — не мешают набирать. */
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});

  const { mutate, isPending } = useMutation({
    mutationFn: usersApi.create,
    onSuccess: (user, { password }) => {
      addUserToList(queryClient, user);
      setCreated({ login: user.login, password });
      setValues(EMPTY);
      setTakenLogin(null);
      setTouched({});
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
  const loginRuleError = getLoginError(login);
  const passwordRuleError = getPasswordError(values.password);
  const isLoginTaken = takenLogin !== null && isSameLogin(login, takenLogin);

  const resolveLoginError = () => {
    if (isLoginTaken) {
      return `Логин ${takenLogin} уже занят`;
    }
    return touched.login && login !== '' ? (loginRuleError ?? undefined) : undefined;
  };

  return {
    values,
    setLogin: (next: string) => setValues((current) => ({ ...current, login: next })),
    setPassword: (next: string) => setValues((current) => ({ ...current, password: next })),
    generatePassword: () => setValues((current) => ({ ...current, password: generatePassword() })),

    touch: (field: Field) => setTouched((current) => ({ ...current, [field]: true })),
    loginError: resolveLoginError(),
    passwordError:
      touched.password && values.password !== '' ? (passwordRuleError ?? undefined) : undefined,
    isCreating: isPending,
    canCreate: !loginRuleError && !passwordRuleError && !isLoginTaken && !isPending,
    create: () => mutate({ login, password: values.password }),

    /** Создан — показываем логин и пароль, пока админ не нажмёт «Готово». */
    created,
    finish: () => setCreated(null),
  };
};

export type CreateUserForm = ReturnType<typeof useCreateUserForm>;
