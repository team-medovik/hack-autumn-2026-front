import { useId } from 'react';

import { useSessionUser } from '@/entities/session';
import { canDeleteUser, UsersTable, useUsers } from '@/entities/user';
import { CreateUserCard } from '@/features/create-user';
import { DeleteUserButton } from '@/features/delete-user';
import { AsideLayout } from '@/shared/ui/aside-layout';
import { Button } from '@/shared/ui/button';
import { Card, CardHeader } from '@/shared/ui/card';
import { SkeletonText } from '@/shared/ui/skeleton';
import { StateMessage } from '@/shared/ui/state-message';

import './users-settings.scss';

/**
 * Вкладка «Пользователи» по макетам «Настройки — пользователи (…)»: список учёток с удалением
 * слева, создание справа.
 */
export const UsersSettings = () => {
  const titleId = useId();
  const { data: users, isError, isFetching, refetch } = useUsers();
  // В сессии логин лежит в поле email — так его называет API авторизации
  const currentLogin = useSessionUser()?.email;

  const renderList = () => {
    if (users) {
      return (
        <UsersTable
          aria-labelledby={titleId}
          users={users}
          currentLogin={currentLogin}
          renderActions={(user) =>
            canDeleteUser(user, currentLogin) && <DeleteUserButton login={user.login} />
          }
        />
      );
    }
    if (isError) {
      return (
        <StateMessage
          role="alert"
          className="users-settings__message"
          title="Не удалось загрузить пользователей"
          description="Сервер не ответил. Попробуйте ещё раз"
          action={
            <Button variant="secondary" active loading={isFetching} onClick={() => void refetch()}>
              Повторить
            </Button>
          }
        />
      );
    }
    return <SkeletonText lines={4} />;
  };

  return (
    <AsideLayout aside={<CreateUserCard />}>
      <Card
        aria-labelledby={titleId}
        aria-busy={!users && !isError}
        className="users-settings__list"
      >
        <CardHeader titleId={titleId} title="Пользователи" />
        {renderList()}
      </Card>
    </AsideLayout>
  );
};
