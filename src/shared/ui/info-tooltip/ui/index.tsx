import { Arrow, Content, Portal, Provider, Root, Trigger } from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Icon } from '../../icon';
import { Text } from '../../text';

import './info-tooltip.scss';

interface InfoTooltipProps {
  /** Пояснение, которое показывается при наведении и фокусе. */
  children: ReactNode;
  /** Подпись кнопки для скринридера. */
  label?: string;
  className?: string;
}

/**
 * Иконка «info» с подсказкой (Radix Tooltip). Открывается наведением и фокусом с клавиатуры.
 *
 * @example
 * <InfoTooltip>Выручка, которую потеряем за месяц, если ничего не делать</InfoTooltip>
 */
export const InfoTooltip = ({ children, label = 'Подробнее', className }: InfoTooltipProps) => (
  <Provider delayDuration={200}>
    <Root>
      <Trigger asChild>
        <button type="button" className={clsx('info-tooltip', className)} aria-label={label}>
          <Icon name="info" />
        </button>
      </Trigger>
      <Portal>
        <Content className="info-tooltip__content" side="top" sideOffset={6} collisionPadding={16}>
          <Text variant="caption" color="main">
            {children}
          </Text>
          <Arrow className="info-tooltip__arrow" />
        </Content>
      </Portal>
    </Root>
  </Provider>
);
