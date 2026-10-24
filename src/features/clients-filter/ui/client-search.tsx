import { useState } from 'react';

import { useDebouncedCallback } from '@/shared/lib/debounce';
import { Input } from '@/shared/ui/input';

/** Пауза после последней буквы, прежде чем искать. */
const SEARCH_DELAY_MS = 300;

interface ClientSearchProps {
  /** Применённый поиск (из URL). */
  value: string;
  /** Вызывается с обрезанной строкой после паузы в наборе. */
  onChange: (search: string) => void;
  className?: string;
}

/**
 * Поиск по email или ID. Поле показывает набранное сразу, а `onChange` — с задержкой.
 * Если поиск сменили снаружи (кнопка «Сбросить поиск», назад в истории), поле подхватит значение.
 */
export const ClientSearch = ({ value, onChange, className }: ClientSearchProps) => {
  const [draft, setDraft] = useState(value);
  // Последнее значение, отданное наружу: отличие от `value` значит, что поиск сменили снаружи
  const [emitted, setEmitted] = useState(value);

  if (value !== emitted) {
    setEmitted(value);
    setDraft(value);
  }

  const emit = useDebouncedCallback((search: string) => {
    setEmitted(search);
    onChange(search);
  }, SEARCH_DELAY_MS);

  return (
    <Input
      type="search"
      label="Поиск по email или ID"
      autoComplete="off"
      value={draft}
      onChange={(event) => {
        setDraft(event.target.value);
        emit(event.target.value.trim());
      }}
      className={className}
    />
  );
};
