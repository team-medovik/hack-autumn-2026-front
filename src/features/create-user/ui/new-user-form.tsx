import type { FormEvent } from 'react';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Text } from '@/shared/ui/text';

import type { CreateUserForm } from '../model/use-create-user-form';

interface NewUserFormProps {
  form: CreateUserForm;
  /** Вернулись после «Готово» — сразу можно вводить следующий логин. */
  autoFocus?: boolean;
}

/** Логин, необязательный ID клиента и «Создать». Пароль задаёт сервер — его покажут после создания. */
export const NewUserForm = ({ form, autoFocus }: NewUserFormProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (form.canCreate) {
      form.create();
    }
  };

  return (
    <form className="create-user-card__body" noValidate onSubmit={handleSubmit}>
      <Input
        label="Логин"
        name="login"
        autoComplete="off"
        spellCheck={false}
        // Фокус возвращается по действию админа — не при открытии вкладки
        autoFocus={autoFocus}
        value={form.login}
        error={form.loginError}
        onChange={(event) => form.setLogin(event.target.value)}
        onBlur={form.touch}
      />
      <Input
        label="ID клиента (необязательно)"
        name="ssoUserId"
        autoComplete="off"
        spellCheck={false}
        value={form.ssoUserId}
        onChange={(event) => form.setSsoUserId(event.target.value)}
      />
      <Text variant="caption" color="secondary">
        Временный пароль сгенерирует сервер и покажет один раз после создания
      </Text>
      <Button
        type="submit"
        variant="primary"
        fullWidth
        loading={form.isCreating}
        disabled={!form.canCreate}
      >
        Создать
      </Button>
    </form>
  );
};
