import { clsx } from 'clsx';
import { useId, type ReactNode } from 'react';

import { HintTooltip } from '../../hint-tooltip';
import { Text } from '../../text';

import './setting-row.scss';

/** Подписи строки для контрола: `aria-labelledby={titleId}`, `aria-describedby={describedBy}`. */
export interface SettingRowIds {
  titleId: string;
  /** id пометки и подсказки через пробел. Нет ни того ни другого — `undefined`. */
  describedBy?: string;
}

interface SettingRowProps {
  title: ReactNode;
  /** Текст подсказки «?» рядом с названием. */
  help?: ReactNode;
  /** Пометка под названием Caption 2 цвета accent: «было 70» у изменённого значения. */
  note?: ReactNode;
  /** Контрол справа: `SliderField`, `Switch`… Получает id подписей строки. */
  children: (ids: SettingRowIds) => ReactNode;
  className?: string;
}

/**
 * Строка настройки (Настройки / признак): название с «?», под ним пометка; контрол справа.
 * Текст подсказки лежит и скрытым в DOM — контрол описан им и без открытой подсказки.
 *
 * @example
 * <SettingRow title="Ожидает оплаты" help="Срок услуги истёк…" note={changed && 'было 70'}>
 *   {({ titleId, describedBy }) => (
 *     <SliderField value={weight} onValueChange={setWeight} aria-labelledby={titleId} aria-describedby={describedBy} />
 *   )}
 * </SettingRow>
 */
export const SettingRow = ({ title, help, note, children, className }: SettingRowProps) => {
  const id = useId();
  const titleId = `${id}-title`;
  const noteId = `${id}-note`;
  const helpId = `${id}-help`;
  const describedBy =
    [note ? noteId : null, help ? helpId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={clsx('setting-row', className)}>
      <div className="setting-row__description">
        <div className="setting-row__title">
          <Text id={titleId} variant="body" color="main">
            {title}
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
        {note && (
          <Text id={noteId} variant="caption-2" color="accent">
            {note}
          </Text>
        )}
      </div>

      {children({ titleId, describedBy })}
    </div>
  );
};
