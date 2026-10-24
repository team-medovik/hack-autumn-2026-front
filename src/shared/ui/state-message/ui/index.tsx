import { clsx } from 'clsx';
import type { ElementType, ReactNode } from 'react';

import { Text } from '../../text';

import './state-message.scss';

/**
 * compact — сообщение внутри блока (Label + Caption, через 12px): «ничего не нашлось», ошибка;
 * hero — крупное пустое состояние (Heading 1 Italic + Body, через 24px): «Клиентов пока нет».
 */
export type StateMessageVariant = 'compact' | 'hero';

interface StateMessageProps {
  title: ReactNode;
  description?: ReactNode;
  /** Иконка над заголовком, например `<Icon name="info-32" size={32} />`. */
  icon?: ReactNode;
  /** Действие под текстом, обычно `<Button>`. */
  action?: ReactNode;
  variant?: StateMessageVariant;
  /** Тег заголовка: по умолчанию `p`, на отдельном экране — `h1`. */
  titleAs?: ElementType;
  /** `alert` — для ошибок: скринридер зачитает сообщение сразу. */
  role?: 'status' | 'alert';
  className?: string;
}

const TITLE_VARIANT = { compact: 'label', hero: 'heading-1-italic' } as const;
const DESCRIPTION_VARIANT = { compact: 'caption', hero: 'body' } as const;

/**
 * Сообщение о состоянии по центру: иконка, заголовок, пояснение, действие.
 *
 * @example
 * <StateMessage
 *   role="alert"
 *   icon={<Icon name="info-32" size={32} />}
 *   title="Не удалось загрузить клиентов"
 *   description="Сервер не ответил. Попробуйте ещё раз через минуту"
 *   action={<Button variant="secondary" active onClick={retry}>Повторить</Button>}
 * />
 */
export const StateMessage = ({
  title,
  description,
  icon,
  action,
  variant = 'compact',
  titleAs = 'p',
  role,
  className,
}: StateMessageProps) => (
  <div className={clsx('state-message', `state-message--${variant}`, className)} role={role}>
    {icon && (
      <span className="state-message__icon" aria-hidden>
        {icon}
      </span>
    )}
    <Text as={titleAs} variant={TITLE_VARIANT[variant]} color="main" align="center">
      {title}
    </Text>
    {description && (
      <Text
        variant={DESCRIPTION_VARIANT[variant]}
        color="secondary"
        align="center"
        className="state-message__description"
      >
        {description}
      </Text>
    )}
    {action}
  </div>
);
