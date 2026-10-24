import { toast } from 'sonner';

import type { CreateUserRequest } from '@/entities/user';
import { useCopyToClipboard } from '@/shared/lib/clipboard';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

/** Сколько висит «Скопировано» на кнопке. */
const COPIED_MS = 2000;

interface CreatedUserProps {
  credentials: CreateUserRequest;
  onDone: () => void;
}

const toClipboardText = ({ login, password }: CreateUserRequest) =>
  `Логин: ${login}\nПароль: ${password}`;

/** Макет «… (пароль создан)»: данные для передачи коллеге, копирование и «Готово». */
export const CreatedUser = ({ credentials, onDone }: CreatedUserProps) => {
  const [isCopied, copy] = useCopyToClipboard(COPIED_MS);

  const handleCopy = () =>
    copy(toClipboardText(credentials)).catch(() =>
      toast.error('Не удалось скопировать', {
        description: 'Браузер не дал доступа к буферу обмена. Скопируйте данные вручную',
      }),
    );

  return (
    <div className="create-user-card__body">
      <Input label="Логин" value={credentials.login} readOnly />
      <Input label="Пароль" value={credentials.password} readOnly spellCheck={false} />
      <Button
        variant="secondary"
        active
        fullWidth
        className="create-user-card__copy"
        // Кнопка «Создать» с фокусом пропала — ведём фокус к следующему шагу
        autoFocus
        onClick={() => void handleCopy()}
      >
        {isCopied ? 'Скопировано' : 'Скопировать логин и пароль'}
      </Button>
      <Button variant="primary" fullWidth onClick={onDone}>
        Готово
      </Button>
    </div>
  );
};
