import { Close, Content, Overlay, Portal, Root, Title } from '@radix-ui/react-dialog';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import './modal.scss';

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Содержимое. Внутри обязателен `<ModalTitle>` — им скринридер называет окно. */
  children: ReactNode;
  className?: string;
}

/**
 * Большое модальное окно поверх страницы (Radix Dialog): затемнение, панель bg/panel, отступы 40px.
 * Контролы внутри — на слое card, как в Figma. Закрывается по Esc, клику мимо и `<ModalClose>`.
 *
 * @example
 * <Modal open onOpenChange={(open) => !open && close()}>
 *   <ModalTitle><Text variant="heading-3">client17@mail.ru</Text></ModalTitle>
 *   <ModalClose><Button variant="icon" aria-label="Закрыть"><Icon name="close" /></Button></ModalClose>
 * </Modal>
 */
export const Modal = ({ open, onOpenChange, children, className }: ModalProps) => (
  <Root open={open} onOpenChange={onOpenChange}>
    <Portal>
      <Overlay className="modal__overlay" />
      {/* Описание у окна не одно — связь с текстом не навязываем */}
      <Content data-layer="card" aria-describedby={undefined} className={clsx('modal', className)}>
        {children}
      </Content>
    </Portal>
  </Root>
);

/** Заголовок окна: оборачивает единственный дочерний элемент (Radix asChild). */
export const ModalTitle = ({ children }: { children: ReactNode }) => (
  <Title asChild>{children}</Title>
);

/** Закрывает окно по клику на единственный дочерний элемент (Radix asChild). */
export const ModalClose = ({ children }: { children: ReactNode }) => (
  <Close asChild>{children}</Close>
);
