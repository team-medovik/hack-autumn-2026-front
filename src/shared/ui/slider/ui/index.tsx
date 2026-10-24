import { Range, Root, Thumb, Track } from '@radix-ui/react-slider';
import { clsx } from 'clsx';

import './slider.scss';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  /** Срабатывает при отпускании ручки — удобно для сохранения на сервер. */
  onValueCommit?: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  /** Подпись ручки для скринридера: `aria-label` или id подписи в `aria-labelledby`. */
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  className?: string;
}

/**
 * Слайдер с одной ручкой. Ширина — по контейнеру (в Figma 240 и 200).
 *
 * @example
 * <Slider value={weight} onValueChange={setWeight} aria-label="Вес признака" />
 */
export const Slider = ({
  value,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  className,
}: SliderProps) => (
  <Root
    className={clsx('slider', className)}
    value={[value]}
    onValueChange={([next]) => onValueChange(next)}
    onValueCommit={onValueCommit && (([next]) => onValueCommit(next))}
    min={min}
    max={max}
    step={step}
    disabled={disabled}
  >
    <Track className="slider__track">
      <Range className="slider__range" />
    </Track>
    <Thumb
      className="slider__thumb"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-describedby={ariaDescribedBy}
    />
  </Root>
);
