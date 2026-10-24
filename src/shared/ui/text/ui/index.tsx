import { clsx } from 'clsx';
import type { ComponentPropsWithoutRef, ElementType } from 'react';

import './text.scss';

/** Текстовые стили из Figma (коллекция Fonts). `body-accent` — стиль «Body Bold». */
export type TextVariant =
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'label'
  | 'body'
  | 'body-accent'
  | 'caption'
  | 'caption-2'
  | 'caption-3';

/** Цвета текста из Figma: text/*, status/*. `inherit` — цвет родителя. */
export type TextColor =
  | 'inherit'
  | 'main'
  | 'secondary'
  | 'tertiary'
  | 'disabled'
  | 'link'
  | 'danger'
  | 'success'
  | 'warning'
  | 'info';

/** Тег по умолчанию: заголовки — h1–h3, остальное — p. */
const DEFAULT_TAG: Record<TextVariant, ElementType> = {
  'heading-1': 'h1',
  'heading-2': 'h2',
  'heading-3': 'h3',
  label: 'p',
  body: 'p',
  'body-accent': 'p',
  caption: 'p',
  'caption-2': 'p',
  'caption-3': 'p',
};

type TextProps<T extends ElementType> = {
  /** HTML-тег или компонент. Стиль и семантика независимы: `<Text variant="heading-1" as="h2">`. */
  as?: T;
  variant?: TextVariant;
  color?: TextColor;
  align?: 'left' | 'center' | 'right';
  /** Обрезать одной строкой с многоточием. */
  truncate?: boolean;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'color'>;

/**
 * Универсальный текст дизайн-системы.
 *
 * @example
 * <Text variant="heading-2">вход в админ-панель</Text>
 * <Text variant="caption" color="secondary">введите логин и пароль</Text>
 * <Text variant="heading-3" as="h1">Заголовок страницы стилем H3</Text>
 * <Text as="span" variant="caption-3" color="danger">Ошибка</Text>
 */
export const Text = <T extends ElementType = 'p'>({
  as,
  variant = 'body',
  color = 'inherit',
  align,
  truncate = false,
  className,
  ...props
}: TextProps<T>) => {
  const Component = as ?? DEFAULT_TAG[variant];

  return (
    <Component
      className={clsx(
        'text',
        `text--${variant}`,
        `text--color-${color}`,
        { [`text--align-${align}`]: align, 'text--truncate': truncate },
        className,
      )}
      {...props}
    />
  );
};
