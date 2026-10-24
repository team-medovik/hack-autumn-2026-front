import { clsx } from 'clsx';
import { useId, useState, type ChangeEvent, type ReactNode } from 'react';

import { NumberField } from '../../number-field';
import { Slider } from '../../slider';
import { Text } from '../../text';

import './setting-row.scss';

interface SettingRowProps {
  title: ReactNode;
  /** Подсказка под названием, например «всегда в полную силу · по умолчанию 70». */
  hint?: ReactNode;
  value: number;
  onValueChange: (value: number) => void;
  /** Сохранённое значение: если текущее отличается — поле в состоянии «Изменено». */
  savedValue?: number;
  min?: number;
  max?: number;
  className?: string;
}

/**
 * Строка настройки признака (Настройки / признак): описание, слайдер и числовое поле,
 * синхронизированные между собой. Некорректный ввод подсвечивает поле ошибкой и не уходит наружу.
 *
 * @example
 * <SettingRow
 *   title="Ожидает оплаты"
 *   hint="всегда в полную силу · по умолчанию 70"
 *   value={weight}
 *   savedValue={70}
 *   onValueChange={setWeight}
 * />
 */
export const SettingRow = ({
  title,
  hint,
  value,
  onValueChange,
  savedValue,
  min = 0,
  max = 100,
  className,
}: SettingRowProps) => {
  const titleId = useId();
  // Черновик ввода живёт, пока пользователь печатает; иначе поле показывает value
  const [draft, setDraft] = useState<string | null>(null);

  /** Целое число в диапазоне [min, max] или null. */
  const parse = (text: string) => {
    const next = Number(text.trim());
    return text.trim() !== '' && Number.isInteger(next) && next >= min && next <= max ? next : null;
  };

  const isValid = draft === null || parse(draft) !== null;

  const handleInput = (event: ChangeEvent<HTMLInputElement>) => {
    setDraft(event.target.value);

    const next = parse(event.target.value);
    if (next !== null) {
      onValueChange(next);
    }
  };

  const handleSlider = (next: number) => {
    setDraft(null);
    onValueChange(next);
  };

  return (
    <div className={clsx('setting-row', className)}>
      <div className="setting-row__description">
        <Text id={titleId} variant="body" color="main">
          {title}
        </Text>
        {hint && (
          <Text variant="caption-2" color="tertiary">
            {hint}
          </Text>
        )}
      </div>

      <Slider
        className="setting-row__slider"
        value={value}
        onValueChange={handleSlider}
        min={min}
        max={max}
        aria-label={typeof title === 'string' ? title : undefined}
      />

      <NumberField
        value={draft ?? String(value)}
        onChange={handleInput}
        onBlur={() => isValid && setDraft(null)}
        error={!isValid}
        changed={savedValue !== undefined && value !== savedValue}
        aria-labelledby={titleId}
      />
    </div>
  );
};
