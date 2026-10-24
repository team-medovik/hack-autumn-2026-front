import { useState, type ChangeEvent, type ComponentProps, type FocusEvent } from 'react';

import { formatNumber, parseDecimal } from '@/shared/lib/format';

import { isAllowed, normalize, stepDecimals } from './step';
import { NumberField } from '../../number-field';

type NumberFieldProps = ComponentProps<typeof NumberField>;

interface NumberInputProps
  extends Omit<NumberFieldProps, 'value' | 'defaultValue' | 'onChange' | 'inputMode'> {
  value: number;
  /** Вызывается только с допустимым числом: в диапазоне и на сетке шага. */
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Шаг: 1 — целые, 0.05 — сотые. Дробная часть вводится через запятую или точку. */
  step?: number;
}

/**
 * Числовое поле с разбором ввода поверх `NumberField`. Пока пользователь печатает, текст живёт
 * черновиком: допустимое число сразу уходит наружу, недопустимое подсвечивает поле ошибкой.
 * При потере фокуса ввод исправляется: число прижимается к диапазону, мусор откатывается.
 *
 * @example
 * <NumberInput value={k} onValueChange={setK} min={0} max={1} step={0.05} aria-label="k" />
 */
export const NumberInput = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  error = false,
  onBlur,
  ...props
}: NumberInputProps) => {
  const [draft, setDraft] = useState<string | null>(null);

  const parsed = draft === null ? value : parseDecimal(draft);
  const isDraftValid = parsed !== null && isAllowed(parsed, min, max, step);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const text = event.target.value;
    setDraft(text);

    const next = parseDecimal(text);
    if (next !== null && isAllowed(next, min, max, step) && next !== value) {
      onValueChange(next);
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    if (parsed !== null) {
      const next = normalize(parsed, min, max, step);
      if (next !== value) {
        onValueChange(next);
      }
    }
    setDraft(null);
    onBlur?.(event);
  };

  return (
    <NumberField
      {...props}
      inputMode={stepDecimals(step) > 0 ? 'decimal' : 'numeric'}
      value={draft ?? formatNumber(value, stepDecimals(step))}
      onChange={handleChange}
      onBlur={handleBlur}
      error={error || !isDraftValid}
    />
  );
};
