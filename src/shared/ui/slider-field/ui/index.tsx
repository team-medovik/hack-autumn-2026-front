import { clsx } from 'clsx';

import { NumberInput } from '../../number-input';
import { Slider } from '../../slider';

import './slider-field.scss';

interface SliderFieldProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Сохранённое значение: если текущее отличается — поле в состоянии «Изменено». */
  savedValue?: number;
  /** Ошибка проверки снаружи (например, порог меньше соседнего) — поле красное. */
  error?: boolean;
  /** Подпись обоих контролов для скринридера: id заголовка и пояснения. */
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
}

/**
 * Слайдер 200px и числовое поле, синхронизированные между собой (правая часть «Настройки / признак»).
 *
 * @example
 * <SliderField value={k} onValueChange={setK} max={1} step={0.05} savedValue={0.5} />
 */
export const SliderField = ({
  value,
  onValueChange,
  min = 0,
  max = 100,
  step = 1,
  savedValue,
  error,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  className,
}: SliderFieldProps) => (
  <div className={clsx('slider-field', className)}>
    <Slider
      className="slider-field__slider"
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    />
    <NumberInput
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      error={error}
      changed={savedValue !== undefined && value !== savedValue}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    />
  </div>
);
