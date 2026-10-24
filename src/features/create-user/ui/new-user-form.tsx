import { useRef, type FormEvent } from 'react';
import { flushSync } from 'react-dom';

import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

import type { CreateUserForm } from '../model/use-create-user-form';

interface NewUserFormProps {
  form: CreateUserForm;
  /** Вернулись после «Готово» — сразу можно вводить следующий логин. */
  autoFocus?: boolean;
}

/**
 * Логин, пароль и «Создать». «Сгенерировать пароль» — пока пароль пуст: по макету с заполненным
 * паролем кнопки нет. Сгенерированный пароль скрыт, его покажут после создания.
 */
export const NewUserForm = ({ form, autoFocus }: NewUserFormProps) => {
  const { values, loginError } = form;
  const loginInput = useRef<HTMLInputElement>(null);
  const createButton = useRef<HTMLButtonElement>(null);

  // Кнопка генерации пропадёт вместе с фокусом — ведём к следующему шагу: «Создать»,
  // а если логин ещё не введён (кнопка недоступна) — к логину
  const generatePassword = () => {
    flushSync(form.generatePassword);
    const next = createButton.current?.disabled ? loginInput.current : createButton.current;
    next?.focus();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (form.canCreate) {
      form.create();
    }
  };

  return (
    <form className="create-user-card__body" noValidate onSubmit={handleSubmit}>
      <Input
        ref={loginInput}
        label="Логин"
        name="login"
        autoComplete="off"
        spellCheck={false}
        // Фокус возвращается по действию админа — не при открытии вкладки
        autoFocus={autoFocus}
        value={values.login}
        error={loginError}
        onChange={(event) => form.setLogin(event.target.value)}
      />
      <Input
        label="Пароль"
        name="password"
        type="password"
        autoComplete="new-password"
        value={values.password}
        onChange={(event) => form.setPassword(event.target.value)}
      />
      {values.password === '' && (
        <Button variant="secondary" active fullWidth onClick={generatePassword}>
          Сгенерировать пароль
        </Button>
      )}
      <Button
        ref={createButton}
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
