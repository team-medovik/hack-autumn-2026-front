import { Slot } from '@radix-ui/react-slot';
import { clsx } from 'clsx';
import { cloneElement, isValidElement, type ComponentProps, type ReactNode } from 'react';

import { Icon } from '../../icon';

import './button.scss';

export type ButtonVariant = 'accent' | 'primary' | 'secondary' | 'danger' | 'icon';

interface ButtonProps extends ComponentProps<'button'> {
  /**
   * Тип из Figma: accent — Акцентная, primary — Первичная, secondary — Вторичная,
   * danger — Опасность, icon — Только иконка (children = иконка, нужен aria-label).
   */
  variant?: ButtonVariant;
  /** Состояние «Загрузка»: вместо содержимого спиннер, клики блокируются. */
  loading?: boolean;
  /** Слот справа. С иконкой текст прижимается к левому краю кнопки. */
  iconRight?: ReactNode;
  /** Растянуть на всю ширину контейнера. */
  fullWidth?: boolean;
  /**
   * Состояние «Активное» из Figma постоянно, а не только при наведении:
   * выбранный фильтр, текущая страница, вторичная кнопка на фоне карточки.
   * Семантику (`aria-pressed` / `aria-current`) задаёт вызывающий код.
   */
  active?: boolean;
  /**
   * Отрендерить стили кнопки на единственном дочернем элементе (Radix Slot),
   * например `<Link>`. Его содержимое оборачивается так же, как у обычной кнопки.
   */
  asChild?: boolean;
}

/**
 * Кнопка дизайн-системы. Одна на все типы — по требованию дизайна не делим на Button/IconButton.
 *
 * @example
 * <Button>Сохранить</Button>
 * <Button variant="primary" iconRight={<Icon name="chevron-right" />} fullWidth>Далее</Button>
 * <Button variant="icon" aria-label="Удалить"><Icon name="trash" /></Button>
 * <Button asChild variant="secondary"><Link to="/demo">Демо</Link></Button>
 */
export const Button = ({
  variant = 'accent',
  loading = false,
  iconRight,
  fullWidth = false,
  active = false,
  asChild = false,
  disabled,
  type = 'button',
  className,
  children,
  ...props
}: ButtonProps) => {
  const hasIconRight = iconRight !== undefined && iconRight !== null;
  const isDisabled = Boolean(disabled) || loading;

  const renderContent = (content: ReactNode) =>
    loading ? (
      <Icon name="loading" />
    ) : (
      <>
        {variant === 'icon' ? content : <span className="button__text">{content}</span>}
        {hasIconRight && <span className="button__icon">{iconRight}</span>}
      </>
    );

  const rootProps = {
    className: clsx(
      'button',
      `button--${variant}`,
      {
        'button--loading': loading,
        'button--with-icon': hasIconRight && !loading,
        'button--full-width': fullWidth,
        'button--active': active,
      },
      className,
    ),
    'aria-busy': loading || undefined,
    ...props,
  };

  if (asChild && isValidElement<{ children?: ReactNode }>(children)) {
    // У ссылок нет атрибута disabled — недоступность через aria-disabled + блок фокуса
    return (
      <Slot
        {...rootProps}
        aria-disabled={isDisabled || undefined}
        tabIndex={isDisabled ? -1 : props.tabIndex}
      >
        {cloneElement(children, undefined, renderContent(children.props.children))}
      </Slot>
    );
  }

  return (
    <button type={type} disabled={isDisabled} {...rootProps}>
      {renderContent(children)}
    </button>
  );
};
