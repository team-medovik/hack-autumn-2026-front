import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { StateMessage } from '../../state-message';

import './status-screen.scss';

interface StatusScreenProps {
  title: ReactNode;
  description?: ReactNode;
  /** Действие под текстом, обычно `<Button variant="primary">`. */
  action?: ReactNode;
  /** `alert` — для ошибок: скринридер зачитает экран сразу. */
  role?: 'status' | 'alert';
  className?: string;
}

/**
 * Экран состояния на всю область контента: «Данных пока нет», «Не удалось загрузить данные».
 * Заголовок — `h1`: экран заменяет собой страницу.
 *
 * @example
 * <StatusScreen
 *   title="Данных пока нет"
 *   description="Загрузите снимок данных из биллинга."
 *   action={<Button variant="primary">Загрузить снимок</Button>}
 * />
 */
export const StatusScreen = ({
  title,
  description,
  action,
  role = 'status',
  className,
}: StatusScreenProps) => (
  <div className={clsx('status-screen', className)}>
    <StateMessage
      variant="hero"
      titleAs="h1"
      role={role}
      title={title}
      description={description}
      action={action}
    />
  </div>
);
