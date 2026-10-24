import { useState } from 'react';

import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

import { ChangePasswordDialog } from './change-password-dialog';

/** «Сменить пароль»: форма в диалоге и итог «Пароль изменён». */
export const ChangePasswordButton = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isChanged, setIsChanged] = useState(false);

  return (
    <>
      <Button variant="secondary" active onClick={() => setIsFormOpen(true)}>
        Сменить пароль
      </Button>
      <ChangePasswordDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onChanged={() => {
          setIsFormOpen(false);
          setIsChanged(true);
        }}
      />
      <Dialog
        variant="info"
        open={isChanged}
        onOpenChange={setIsChanged}
        title="Пароль изменён"
        description="Новый пароль действует сразу. На других устройствах нужно будет войти заново."
      />
    </>
  );
};
