import { clsx } from 'clsx';
import { useId, type ReactNode } from 'react';

import { HintTooltip } from '../../hint-tooltip';
import { Text } from '../../text';

import './field.scss';

/** inline — подпись Body слева через 12px («Средний от»), stacked — Caption сверху через 8px. */
export type FieldLayout = 'inline' | 'stacked';

/** Связь контрола с подписью: `id` — для `<label htmlFor>`, `describedBy` — текст подсказки. */
export interface FieldIds {
  id: string;
  describedBy?: string;
}

interface FieldProps {
  label: ReactNode;
  /** Текст подсказки «?» рядом с подписью. */
  help?: ReactNode;
  /** Поле ввода: передайте ему `id` (и `aria-describedby`) из аргумента. */
  children: (ids: FieldIds) => ReactNode;
  layout?: FieldLayout;
  className?: string;
}

const LABEL_VARIANT = { inline: 'body', stacked: 'caption' } as const;

/**
 * Подпись к полю ввода (Поле / число с подписью), при необходимости с «?».
 * Подпись — `<label htmlFor>`: кнопка подсказки не попадает внутрь неё.
 *
 * @example
 * <Field label="Средний от" help="Риск от этого значения и выше считается средним">
 *   {({ id, describedBy }) => (
 *     <NumberInput id={id} aria-describedby={describedBy} value={medium} onValueChange={setMedium} />
 *   )}
 * </Field>
 */
export const Field = ({ label, help, children, layout = 'inline', className }: FieldProps) => {
  const id = useId();
  const helpId = `${id}-help`;

  return (
    <div className={clsx('field', `field--${layout}`, className)}>
      <div className="field__label">
        <Text as="label" htmlFor={id} variant={LABEL_VARIANT[layout]} color="secondary">
          {label}
        </Text>
        {help && (
          <>
            <HintTooltip label="Подсказка">{help}</HintTooltip>
            <span id={helpId} hidden>
              {help}
            </span>
          </>
        )}
      </div>
      {children({ id, describedBy: help ? helpId : undefined })}
    </div>
  );
};
