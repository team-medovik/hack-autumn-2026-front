import { useState, type KeyboardEvent } from 'react';

import { formatDateTimeUtc, parseDateTimeUtc } from '@/shared/lib/format';
import { Input } from '@/shared/ui/input';

const FORMAT_ERROR = 'Введите дату и время как 19.10.2026, 15:00';

interface FixedAtFieldProps {
  /** Сохранённый момент, ISO. Меняется — передавайте `key`, чтобы сбросить ввод. */
  value: string;
  onCommit: (iso: string) => void;
  disabled?: boolean;
}

/** Поле «Дата и время, UTC»: сохраняет по Enter и при уходе с поля, если дата верная. */
export const FixedAtField = ({ value, onCommit, disabled }: FixedAtFieldProps) => {
  const [text, setText] = useState(() => formatDateTimeUtc(value));
  const [error, setError] = useState<string>();

  const commit = () => {
    const iso = parseDateTimeUtc(text);
    if (!iso) {
      setError(FORMAT_ERROR);
      return;
    }
    setError(undefined);
    setText(formatDateTimeUtc(iso));
    if (iso !== value) {
      onCommit(iso);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      commit();
    }
  };

  return (
    <Input
      label="Дата и время, UTC"
      inputMode="numeric"
      autoComplete="off"
      className="calculation-date__field"
      value={text}
      error={error}
      disabled={disabled}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={handleKeyDown}
    />
  );
};
