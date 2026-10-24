import {
  Action,
  Cancel,
  Content,
  Description,
  Overlay,
  Portal,
  Root,
  Title,
  Trigger,
} from '@radix-ui/react-alert-dialog';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Button } from '../../button';
import { Text } from '../../text';

import './dialog.scss';

/** Тип из Figma: default — Обычный, danger — Опасный, info — Информация (одна кнопка). */
export type DialogVariant = 'default' | 'danger' | 'info';

/** Ширина: m — 480px (подтверждения), l — 560px (пояснения с блоками расчёта, `children`). */
export type DialogSize = 'm' | 'l';

interface DialogProps {
  title: ReactNode;
  /** Строка или несколько абзацев (`<p>`) — обёртка блочная. */
  description?: ReactNode;
  /** Содержимое под текстом, перед кнопками: блоки расчёта, списки. */
  children?: ReactNode;
  variant?: DialogVariant;
  size?: DialogSize;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Элемент, открывающий диалог (рендерится через asChild). Можно не передавать при управлении через `open`. */
  trigger?: ReactNode;
  /** Текст основной кнопки. По умолчанию «Подтвердить», для info — «Понятно». */
  confirmLabel?: ReactNode;
  cancelLabel?: ReactNode;
  onConfirm?: () => void;
  /**
   * Действие второй кнопки, если она не просто закрывает диалог («Сохранить поверх»).
   * Esc и клик мимо окна его не вызывают — только `onOpenChange(false)`.
   */
  onCancel?: () => void;
  className?: string;
}

/**
 * Диалог подтверждения (Radix AlertDialog): заголовок, описание, Отмена + действие.
 *
 * @example
 * <Dialog
 *   variant="danger"
 *   title="Удалить настройки?"
 *   description="Веса признаков вернутся к значениям по умолчанию."
 *   trigger={<Button variant="danger">Сбросить</Button>}
 *   onConfirm={reset}
 * />
 */
export const Dialog = ({
  title,
  description,
  children,
  variant = 'default',
  size = 'm',
  open,
  onOpenChange,
  trigger,
  confirmLabel = variant === 'info' ? 'Понятно' : 'Подтвердить',
  cancelLabel = 'Отмена',
  onConfirm,
  onCancel,
  className,
}: DialogProps) => (
  <Root open={open} onOpenChange={onOpenChange}>
    {trigger && <Trigger asChild>{trigger}</Trigger>}
    <Portal>
      <Overlay className="dialog__overlay" />
      <Content data-layer="card" className={clsx('dialog', `dialog--${size}`, className)}>
        <div className="dialog__text">
          <Title asChild>
            <Text variant="heading-3" as="h2" color="main">
              {title}
            </Text>
          </Title>
          {description && (
            <Description asChild>
              <Text as="div" variant="body" color="secondary">
                {description}
              </Text>
            </Description>
          )}
        </div>

        {children}

        <div className="dialog__actions">
          {variant !== 'info' && (
            <Cancel asChild>
              <Button variant="secondary" onClick={onCancel}>
                {cancelLabel}
              </Button>
            </Cancel>
          )}
          <Action asChild>
            <Button variant={variant === 'danger' ? 'danger' : 'primary'} onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </Action>
        </div>
      </Content>
    </Portal>
  </Root>
);
