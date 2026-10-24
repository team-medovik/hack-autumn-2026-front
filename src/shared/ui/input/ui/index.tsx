import { Label } from '@radix-ui/react-label';
import { clsx } from 'clsx';
import { useId, type ComponentProps } from 'react';

import './input.scss';

interface InputProps extends Omit<ComponentProps<'input'>, 'placeholder'> {
  /** Плавающий лейбл: в пустом поле — как плейсхолдер, при фокусе и со значением уходит наверх. */
  label: string;
  /** Текст ошибки под полем. `true` — только красная рамка, без текста. */
  error?: string | boolean;
}

/**
 * Поле ввода дизайн-системы. Состояния из Figma: Пустое, Фокус, Заполненное, Ошибка, Недоступное.
 * Совместимо с react-hook-form: `<Input label="e-mail" {...register('email')} error={errors.email?.message} />`.
 */
export const Input = ({ label, error, className, id, disabled, ...props }: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorText = typeof error === 'string' ? error : undefined;

  return (
    <div
      className={clsx(
        'input',
        { 'input--error': Boolean(error), 'input--disabled': disabled },
        className,
      )}
    >
      <div className="input__field">
        <input
          id={inputId}
          className="input__control"
          // Пробел нужен для :placeholder-shown — по нему CSS понимает, что поле пустое
          placeholder=" "
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorText ? helperId : undefined}
          {...props}
        />
        <Label htmlFor={inputId} className="input__label">
          {label}
        </Label>
      </div>

      {errorText && (
        <p id={helperId} className="input__helper" role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
};
