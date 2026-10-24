import type { ComponentProps } from 'react';

import { Button } from '@/shared/ui/button';

import { useLogoutAction } from '../model/use-logout';

type LogoutButtonProps = Omit<ComponentProps<typeof Button>, 'onClick' | 'loading' | 'children'>;

/** «Выйти»: завершает сессию. Вид кнопки — от места: в навбаре вторичная, в настройках активная. */
export const LogoutButton = ({ variant = 'secondary', ...props }: LogoutButtonProps) => {
  const { mutate: logout, isPending } = useLogoutAction();

  return (
    <Button variant={variant} loading={isPending} onClick={() => logout()} {...props}>
      Выйти
    </Button>
  );
};
