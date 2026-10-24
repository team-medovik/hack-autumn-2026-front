import { Button } from '@/shared/ui/button';
import { FormDialog } from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';

import { useChangePasswordForm } from '../model/use-change-password-form';

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}

/** Макет «Настройки — другое (смена пароля)». */
export const ChangePasswordDialog = ({
  open,
  onOpenChange,
  onChanged,
}: ChangePasswordDialogProps) => {
  const form = useChangePasswordForm({ onChanged });
  const { values, errors } = form;
  const newPasswordType = form.isRevealed ? 'text' : 'password';

  return (
    <FormDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          form.reset();
        }
        onOpenChange(next);
      }}
      title="Сменить пароль"
      description="После смены пароля вход на других устройствах сбросится"
      submitLabel="Сменить"
      canSubmit={form.canSubmit}
      isSubmitting={form.isSubmitting}
      onSubmit={form.submit}
    >
      <Input
        label="Текущий пароль"
        type="password"
        autoComplete="current-password"
        value={values.current}
        error={errors.current}
        onChange={(event) => form.setCurrent(event.target.value)}
      />
      <Input
        label="Новый пароль"
        type={newPasswordType}
        autoComplete="new-password"
        spellCheck={false}
        value={values.next}
        error={errors.next}
        onChange={(event) => form.setNext(event.target.value)}
        onBlur={() => form.touch('next')}
      />
      <Input
        label="Повторите новый пароль"
        type={newPasswordType}
        autoComplete="new-password"
        spellCheck={false}
        value={values.repeat}
        error={errors.repeat}
        onChange={(event) => form.setRepeat(event.target.value)}
        onBlur={() => form.touch('repeat')}
      />
      {/* Не прячем после генерации: можно сгенерировать другой, и фокус не теряется */}
      <Button variant="secondary" active fullWidth onClick={form.generate}>
        Сгенерировать пароль
      </Button>
    </FormDialog>
  );
};
