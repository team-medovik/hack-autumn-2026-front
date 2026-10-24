import type { User } from '@/entities/user';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Icon } from '@/shared/ui/icon';

import { useDeleteUser } from '../model/use-delete-user';

interface DeleteUserButtonProps {
  user: Pick<User, 'id' | 'login'>;
}

/** Корзина в строке пользователя: удаление после подтверждения (макет «… (удаление)»). */
export const DeleteUserButton = ({ user }: DeleteUserButtonProps) => {
  const { login } = user;
  const { mutate, isPending } = useDeleteUser();

  return (
    <Dialog
      variant="danger"
      title={`Удалить пользователя ${login}?`}
      description="Он сразу потеряет доступ к панели. Отменить удаление нельзя — понадобится создать аккаунт заново."
      confirmLabel="Удалить"
      onConfirm={() => mutate(user)}
      trigger={
        <Button variant="icon" loading={isPending} aria-label={`Удалить ${login}`}>
          <Icon name="trash" />
        </Button>
      }
    />
  );
};
