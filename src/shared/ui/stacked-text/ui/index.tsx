import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Text } from '../../text';

import './stacked-text.scss';

interface StackedTextProps {
  /** Основная строка — Caption, text/secondary: «20.10.2026». */
  primary: ReactNode;
  /** Уточнение под ней — Caption 2, text/tertiary: кто создал. */
  secondary?: ReactNode;
  className?: string;
}

/**
 * Значение с уточнением в две строки через 2px (ячейка «Создан» в списке пользователей).
 * Обе строки обрезаются многоточием.
 *
 * @example
 * <StackedText primary="20.10.2026" secondary="admin" />
 */
export const StackedText = ({ primary, secondary, className }: StackedTextProps) => (
  <span className={clsx('stacked-text', className)}>
    <Text as="span" variant="caption" color="secondary" truncate>
      {primary}
    </Text>
    {secondary !== undefined && (
      <Text as="span" variant="caption-2" color="tertiary" truncate>
        {secondary}
      </Text>
    )}
  </span>
);
