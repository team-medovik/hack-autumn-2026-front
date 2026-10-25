import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { getLoginError, isSameLogin, usersApi, usersKeys } from '@/entities/user';
import { isConflictError } from '@/shared/api';

/** Что показать после создания: логин, ID клиента (если задавали) и временный пароль от сервера. */
export interface CreatedCredentials {
  login: string;
  password: string;
  ssoUserId?: string;
}

/**
 * Форма «Новый пользователь»: ввод логина и необязательного ID клиента, создание и показ выданных данных. Пароль генерирует
 * сервер и отдаёт один раз — он виден только до «Готово», нигде не сохраняется.
 */
export const useCreateUserForm = () => {
  const queryClient = useQueryClient();
  const [login, setLogin] = useState('');
  const [ssoUserId, setSsoUserId] = useState('');
  /** Логин, на котором сервер ответил «занят». Ошибка висит, пока его не поменяют. */
  const [takenLogin, setTakenLogin] = useState<string | null>(null);
  const [created, setCreated] = useState<CreatedCredentials | null>(null);
  /** Ошибку правил показываем, когда с поля ушли, — не мешает набирать. */
  const [isTouched, setIsTouched] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: usersApi.create,
    onSuccess: ({ login: createdLogin, temporaryPassword }, request) => {
      // В ответе на создание роль и статус — без перечня значений, список берём с сервера
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      // ID клиента сервер в ответе не возвращает — показываем тот, что отправили
      setCreated({
        login: createdLogin,
        password: temporaryPassword,
        ssoUserId: request.ssoUserId,
      });
      setLogin('');
      setSsoUserId('');
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
  const trimmedSsoUserId = ssoUserId.trim();
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
    ssoUserId,
    setSsoUserId,
    isCreating: isPending,
    canCreate: !ruleError && !isLoginTaken && !isPending,
    create: () =>
      mutate({
        login: trimmed,
        // Пустой ID клиента не шлём — поле необязательное
        ssoUserId: trimmedSsoUserId || undefined,
        role: 'EMPLOYEE',
        status: 'ACTIVE',
      }),

    /** Создан — показываем логин и пароль, пока админ не нажмёт «Готово». */
    created,
    finish: () => setCreated(null),
  };
};

export type CreateUserForm = ReturnType<typeof useCreateUserForm>;
