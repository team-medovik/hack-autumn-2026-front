import { Content, Portal, Provider, Root, Trigger } from '@radix-ui/react-tooltip';
import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Icon } from '../../icon';
import { Text } from '../../text';

import './hint-tooltip.scss';

interface HintTooltipProps {
  /** Пояснение: показывается при наведении и фокусе с клавиатуры. */
  children: ReactNode;
  /** Подпись кнопки для скринридера: «Что такое „Ожидает оплаты“». */
  label?: string;
  className?: string;
}

/**
 * Значок «?» с подсказкой (слой «Подсказка» в Figma): плашка control/on-card до 280px,
 * Caption, под значком. Для параметров настроек — рядом с названием.
 *
 * @example
 * <HintTooltip label="Что такое «Средний от»">Риск от этого значения и выше считается средним</HintTooltip>
 */
export const HintTooltip = ({ children, label = 'Подсказка', className }: HintTooltipProps) => (
  <Provider delayDuration={150}>
    <Root>
      <Trigger asChild>
        <button type="button" className={clsx('hint-tooltip', className)} aria-label={label}>
          <Icon name="help-16" size={16} />
        </button>
      </Trigger>
      <Portal>
        <Content
          className="hint-tooltip__content"
          side="bottom"
          align="start"
          sideOffset={4}
          collisionPadding={16}
        >
          <Text variant="caption" color="main">
            {children}
          </Text>
        </Content>
      </Portal>
    </Root>
  </Provider>
);
