import { clsx } from 'clsx';
import type { ReactNode } from 'react';

import { Text } from '../../text';

import './field.scss';

/** inline — подпись Body слева через 12px («Средний от»), stacked — Caption сверху через 8px. */
export type FieldLayout = 'inline' | 'stacked';

interface FieldProps {
  label: ReactNode;
  /** Поле ввода. Подписывается самим `<label>` — id не нужны. */
  children: ReactNode;
  layout?: FieldLayout;
  className?: string;
}

const LABEL_VARIANT = { inline: 'body', stacked: 'caption' } as const;

/**
 * Подпись к полю ввода (Поле / число с подписью).
 *
 * @example
 * <Field label="Средний от">
 *   <NumberInput value={medium} onValueChange={setMedium} />
 * </Field>
 * <Field label="Горизонт, дней" layout="stacked">…</Field>
 */
export const Field = ({ label, children, layout = 'inline', className }: FieldProps) => (
  <label className={clsx('field', `field--${layout}`, className)}>
    <Text as="span" variant={LABEL_VARIANT[layout]} color="secondary" className="field__label">
      {label}
    </Text>
    {children}
  </label>
);
