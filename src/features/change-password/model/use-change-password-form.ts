import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';

import { generatePassword, getPasswordError } from '@/shared/lib/password';

import { changePassword, isInvalidCurrentPassword } from '../api/change-password.api';

interface Values {
  current: string;
  next: string;
  repeat: string;
}

const EMPTY: Values = { current: '', next: '', repeat: '' };

type Field = keyof Values;

interface FormOptions {
  /** Пароль сменён. */
  onChanged: () => void;
}

/**
 * Форма «Сменить пароль»: текущий, новый и повтор. Ошибки правил и совпадения показываются,
 * когда с поля ушли, — не мешают набирать.
 */
export const useChangePasswordForm = ({ onChanged }: FormOptions) => {
  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  /** Сгенерированный пароль показываем открытым — иначе его не узнать. */
  const [isRevealed, setIsRevealed] = useState(false);
  const [isWrongCurrent, setIsWrongCurrent] = useState(false);

  const reset = () => {
    setValues(EMPTY);
    setTouched({});
    setIsRevealed(false);
    setIsWrongCurrent(false);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      reset();
      onChanged();
    },
    onError: (error) => {
      if (isInvalidCurrentPassword(error)) {
        setIsWrongCurrent(true);
        return;
      }
      toast.error('Не удалось сменить пароль', {
        description: 'Сервер не ответил. Попробуйте ещё раз',
      });
    },
  });

  const nextRuleError = getPasswordError(values.next);
  const isNextValid = nextRuleError === null;
  const isRepeatValid = values.repeat === values.next;

  const change = (field: Field) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field === 'current') {
      setIsWrongCurrent(false);
    }
  };

  return {
    values,
    setCurrent: change('current'),
    setNext: change('next'),
    setRepeat: change('repeat'),
    touch: (field: Field) => setTouched((current) => ({ ...current, [field]: true })),

    errors: {
      current: isWrongCurrent ? 'Неверный текущий пароль' : undefined,
      next: touched.next && values.next ? (nextRuleError ?? undefined) : undefined,
      repeat: touched.repeat && values.repeat && !isRepeatValid ? 'Пароли не совпадают' : undefined,
    },

    isRevealed,
    generate: () => {
      const password = generatePassword();
      setValues((current) => ({ ...current, next: password, repeat: password }));
      setIsRevealed(true);
    },

    isSubmitting: isPending,
    canSubmit:
      values.current !== '' && isNextValid && isRepeatValid && !isWrongCurrent && !isPending,
    submit: () => mutate({ currentPassword: values.current, newPassword: values.next }),
    /** Закрыли без смены — введённое не храним. */
    reset,
  };
};
