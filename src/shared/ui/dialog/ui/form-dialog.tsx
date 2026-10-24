import { Close, Content, Description, Overlay, Portal, Root, Title } from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import type { FormEvent, ReactNode } from 'react';

import type { DialogSize } from './index';
import { Button } from '../../button';
import { Text } from '../../text';

import './dialog.scss';

interface FormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  /** Поля формы — между текстом и кнопками, через 16px. */
  children: ReactNode;
  submitLabel: ReactNode;
  cancelLabel?: ReactNode;
  /** Отправка — по кнопке и по Enter. Окно не закрывается само: закрывает вызывающий код. */
  onSubmit: () => void;
  /** Можно ли отправить: иначе основная кнопка недоступна. */
  canSubmit?: boolean;
  /** Идёт отправка: спиннер на кнопке. */
  isSubmitting?: boolean;
  size?: DialogSize;
  className?: string;
}

/**
 * Диалог с формой (Radix Dialog): заголовок, описание, поля, Отмена + действие.
 * Выглядит как `Dialog`, но блоки — через 16px, а кнопка действия — submit формы.
 *
 * @example
 * <FormDialog open={open} onOpenChange={setOpen} title="Сменить пароль" submitLabel="Сменить"
 *   canSubmit={isValid} isSubmitting={isPending} onSubmit={save}>
 *   <Input label="Текущий пароль" type="password" … />
 * </FormDialog>
 */
export const FormDialog = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitLabel,
  cancelLabel = 'Отмена',
  onSubmit,
  canSubmit = true,
  isSubmitting = false,
  size = 'm',
  className,
}: FormDialogProps) => {
  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (canSubmit && !isSubmitting) {
      onSubmit();
    }
  };

  return (
    <Root open={open} onOpenChange={onOpenChange}>
      <Portal>
        <Overlay className="dialog__overlay" />
        <Content
          data-layer="card"
          // Без описания говорим Radix явно, что связывать нечего, — иначе он предупреждает
          {...(description ? {} : { 'aria-describedby': undefined })}
          className={clsx('dialog', `dialog--${size}`, className)}
        >
          <form className="dialog__form" noValidate onSubmit={handleSubmit}>
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
              <Close asChild>
                <Button variant="secondary">{cancelLabel}</Button>
              </Close>
              <Button type="submit" variant="primary" loading={isSubmitting} disabled={!canSubmit}>
                {submitLabel}
              </Button>
            </div>
          </form>
        </Content>
      </Portal>
    </Root>
  );
};
