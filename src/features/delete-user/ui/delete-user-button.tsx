import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';
import { Icon } from '@/shared/ui/icon';

import { useDeleteUser } from '../model/use-delete-user';

interface DeleteUserButtonProps {
  login: string;
}

/** Корзина в строке пользователя: удаление после подтверждения (макет «… (удаление)»). */
export const DeleteUserButton = ({ login }: DeleteUserButtonProps) => {
  const { mutate, isPending } = useDeleteUser();

  return (
    <Dialog
      variant="danger"
      title={`Удалить пользователя ${login}?`}
      description="Он сразу потеряет доступ к панели. Отменить удаление нельзя — понадобится создать аккаунт заново."
      confirmLabel="Удалить"
      onConfirm={() => mutate(login)}
      trigger={
        <Button variant="icon" loading={isPending} aria-label={`Удалить ${login}`}>
          <Icon name="trash" />
        </Button>
      }
    />
  );
};
