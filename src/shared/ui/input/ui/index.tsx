import { Label } from '@radix-ui/react-label';
import { clsx } from 'clsx';
import { Eye, EyeOff } from 'lucide-react';
import { useId, useState, type ComponentProps } from 'react';

import './input.scss';

interface InputProps extends Omit<ComponentProps<'input'>, 'placeholder'> {
  /** Плавающий лейбл: в пустом поле — как плейсхолдер, при фокусе и со значением уходит наверх. */
  label: string;
  /** Текст ошибки под полем. `true` — только красная рамка, без текста. */
  error?: string | boolean;
}

/**
 * Поле ввода дизайн-системы. Состояния из Figma: Пустое, Фокус, Заполненное, Ошибка, Недоступное.
 * У `type="password"` справа «глаз» — показать или скрыть пароль.
 * Совместимо с react-hook-form: `<Input label="e-mail" {...register('email')} error={errors.email?.message} />`.
 */
export const Input = ({ label, error, className, id, disabled, type, ...props }: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const errorText = typeof error === 'string' ? error : undefined;
  const isPassword = type === 'password';
  const [isRevealed, setIsRevealed] = useState(false);

  return (
    <div
      className={clsx(
        'input',
        {
          'input--error': Boolean(error),
          'input--disabled': disabled,
          'input--with-action': isPassword,
        },
        className,
      )}
    >
      <div className="input__field">
        <input
          id={inputId}
          className="input__control"
          type={isPassword && isRevealed ? 'text' : type}
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
        {isPassword && (
          <button
            type="button"
            className="input__action"
            disabled={disabled}
            aria-label={isRevealed ? 'Скрыть пароль' : 'Показать пароль'}
            aria-pressed={isRevealed}
            aria-controls={inputId}
            onClick={() => setIsRevealed((revealed) => !revealed)}
          >
            {isRevealed ? (
              <EyeOff size={24} strokeWidth={1.5} aria-hidden />
            ) : (
              <Eye size={24} strokeWidth={1.5} aria-hidden />
            )}
          </button>
        )}
      </div>

      {errorText && (
        <p id={helperId} className="input__helper" role="alert">
          {errorText}
        </p>
      )}
    </div>
  );
};
