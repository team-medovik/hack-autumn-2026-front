import { toast } from 'sonner';

import { useCopyToClipboard } from '@/shared/lib/clipboard';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

import type { CreatedCredentials } from '../model/use-create-user-form';

/** Сколько висит «Скопировано» на кнопке. */
const COPIED_MS = 2000;

interface CreatedUserProps {
  credentials: CreatedCredentials;
  onDone: () => void;
}

/** Макет «… (пароль создан)»: данные для передачи коллеге, копирование и «Готово». */
export const CreatedUser = ({ credentials, onDone }: CreatedUserProps) => {
  const [isCopied, copy] = useCopyToClipboard(COPIED_MS);

  const handleCopy = () =>
    copy(credentials.password).catch(() =>
      toast.error('Не удалось скопировать', {
        description: 'Браузер не дал доступа к буферу обмена. Скопируйте пароль вручную',
      }),
    );

  return (
    <div className="create-user-card__body">
      <Input label="Логин" value={credentials.login} readOnly />
      {credentials.clientId && (
        <Input label="ID клиента" value={credentials.clientId} readOnly spellCheck={false} />
      )}
      <Input label="Временный пароль" value={credentials.password} readOnly spellCheck={false} />
      <Button
        variant="secondary"
        active
        fullWidth
        // Кнопка «Создать» с фокусом пропала — ведём фокус к следующему шагу
        autoFocus
        onClick={() => void handleCopy()}
      >
        {isCopied ? 'Скопировано' : 'Скопировать пароль'}
      </Button>
      <Button variant="primary" fullWidth onClick={onDone}>
        Готово
      </Button>
    </div>
  );
};
