import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { isSameLogin, getLoginError, usersApi, usersKeys } from '@/entities/user';
import { isConflictError } from '@/shared/api';

/** Что показать после создания: логин и временный пароль от сервера. */
export interface CreatedCredentials {
  login: string;
  password: string;
}

/**
 * Форма «Новый пользователь»: ввод логина, создание и показ выданных данных. Пароль генерирует
 * сервер и отдаёт один раз — он виден только до «Готово», нигде не сохраняется.
 */
export const useCreateUserForm = () => {
  const queryClient = useQueryClient();
  const [login, setLogin] = useState('');
  /** Логин, на котором сервер ответил «занят». Ошибка висит, пока его не поменяют. */
  const [takenLogin, setTakenLogin] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedCredentials | null>(null);
  /** Ошибку правил показываем, когда с поля ушли, — не мешает набирать. */
  const [isTouched, setIsTouched] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: usersApi.create,
    onSuccess: ({ login: createdLogin, temporaryPassword }) => {
      // В ответе на создание роль и статус — без перечня значений, список берём с сервера
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      setCreated({ login: createdLogin, password: temporaryPassword });
      setLogin('');
      setTakenLogin(null);
      setIsTouched(false);
    },
    onError: (error, { login: requested }) => {
      if (isConflictError(error)) {
        setTakenLogin(requested);
        return;
      }
      toast.error('Не удалось создать пользователя', {
        description: 'Сервер не ответил. Логин остался в форме — попробуйте ещё раз',
      });
    },
  });

  const trimmed = login.trim();
  const ruleError = getLoginError(trimmed);
  const isLoginTaken = takenLogin !== null && isSameLogin(trimmed, takenLogin);

  const resolveLoginError = () => {
    if (isLoginTaken) {
      return `Логин ${takenLogin} уже занят`;
    }
    return isTouched && trimmed !== '' ? (ruleError ?? undefined) : undefined;
  };

  return {
    login,
    setLogin,
    touch: () => setIsTouched(true),
    loginError: resolveLoginError(),
    isCreating: isPending,
    canCreate: !ruleError && !isLoginTaken && !isPending,
    create: () => mutate({ login: trimmed, role: 'EMPLOYEE', status: 'ACTIVE' }),

    /** Создан — показываем логин и пароль, пока админ не нажмёт «Готово». */
    created,
    finish: () => setCreated(null),
  };
};

export type CreateUserForm = ReturnType<typeof useCreateUserForm>;
