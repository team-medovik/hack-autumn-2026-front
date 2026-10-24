import { Root, Thumb } from '@radix-ui/react-switch';
import { clsx } from 'clsx';
import type { ComponentProps } from 'react';

import './switch.scss';

type SwitchProps = Omit<ComponentProps<typeof Root>, 'asChild' | 'children'>;

/**
 * Переключатель 40×24. Состояния из Figma: Вкл / Выкл.
 * Нужна подпись: `aria-label` или `<label htmlFor>`.
 *
 * @example
 * <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="Учитывать признак" />
 */
export const Switch = ({ className, ...props }: SwitchProps) => (
  <Root className={clsx('switch', className)} {...props}>
    <Thumb className="switch__thumb" />
  </Root>
);
