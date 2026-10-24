import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

import './number-field.scss';

interface NumberFieldProps extends Omit<ComponentProps<'input'>, 'type'> {
  /** Состояние «Изменено»: значение отличается от сохранённого — бирюзовая рамка. */
  changed?: boolean;
  /** Состояние «Ошибка»: красная рамка. Имеет приоритет над `changed`. */
  error?: boolean;
}

/**
 * Компактное числовое поле 72×40 (Поле / число). Состояния: Обычное, Изменено, Ошибка.
 * Текстовый input с `inputMode="numeric"` — без стрелок браузера, парсинг на стороне вызывающего.
 *
 * @example
 * <NumberField value={draft} onChange={(e) => setDraft(e.target.value)} changed={draft !== saved} />
 */
export const NumberField = ({
  changed = false,
  error = false,
  className,
  ...props
}: NumberFieldProps) => (
  <input
    type="text"
    inputMode="numeric"
    autoComplete="off"
    className={clsx(
      'number-field',
      { 'number-field--changed': changed && !error, 'number-field--error': error },
      className,
    )}
    aria-invalid={error || undefined}
    {...props}
  />
);
