import { useId, useState } from 'react';

import { Card, CardHeader } from '@/shared/ui/card';

import { CreatedUser } from './created-user';
import { NewUserForm } from './new-user-form';
import { useCreateUserForm } from '../model/use-create-user-form';

import './create-user-card.scss';

/**
 * Блок «Новый пользователь» по макетам «Настройки — пользователи (…)»: форма, ошибка занятого
 * логина и показ логина с временным паролем, который выдал сервер.
 */
export const CreateUserCard = () => {
  const titleId = useId();
  const form = useCreateUserForm();
  const [hasFinished, setHasFinished] = useState(false);

  const finish = () => {
    form.finish();
    setHasFinished(true);
  };

  return (
    <Card aria-labelledby={titleId} className="create-user-card">
      {form.created ? (
        <>
          <CardHeader
            titleId={titleId}
            title="Пользователь создан"
            description="Скопируйте данные и передайте коллеге. Пароль больше не покажем"
          />
          <CreatedUser credentials={form.created} onDone={finish} />
        </>
      ) : (
        <>
          <CardHeader titleId={titleId} title="Новый пользователь" />
          <NewUserForm form={form} autoFocus={hasFinished} />
        </>
      )}
    </Card>
  );
};
